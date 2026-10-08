package com.expo.sales.service;

import com.expo.sales.dto.ApiDtos;
import com.expo.sales.entity.*;
import com.expo.sales.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpoService {
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final AppSettingsRepository settings;
    private final RealtimeEventService realtimeEvents;
    @Value("${app.low-stock-threshold:3}")
    private int lowStockThreshold;
    @Value("${app.admin-password:root}")
    private String adminPassword;

    public ExpoService(CategoryRepository categories,
                       ProductRepository products,
                       OrderRepository orders,
                       AppSettingsRepository settings,
                       RealtimeEventService realtimeEvents) {
        this.categories = categories;
        this.products = products;
        this.orders = orders;
        this.settings = settings;
        this.realtimeEvents = realtimeEvents;
    }

    public List<ApiDtos.CategoryResponse> getCategories() {
        Map<String, Long> counts = products.findAll().stream().filter(Product::isActive)
                .collect(Collectors.groupingBy(p -> p.getCategory().getId(), Collectors.counting()));
        return categories.findAll().stream()
                .map(c -> new ApiDtos.CategoryResponse(c.getId(), c.getName(), c.getNameJa(), c.getIcon(), counts.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    public List<ApiDtos.ProductResponse> getProducts() {
        return products.findAll().stream().filter(Product::isActive).map(this::product).toList();
    }

    public ApiDtos.ProductResponse getProduct(String id) {
        return products.findById(id).map(this::product)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    private ApiDtos.ProductResponse product(Product p) {
        return new ApiDtos.ProductResponse(
                p.getId(), p.getName(), p.getNameJa(), p.getCategory().getId(),
                p.getCategory().getName(), p.getPrice(), p.getStock(), p.getImageUrl(),
                p.getDescription(), false, p.getSoldCount());
    }

    public ApiDtos.SettingsResponse getSettings() {
        var s = settings.findById(1L).orElseGet(() -> settings.save(new AppSettingsEntity()));
        return new ApiDtos.SettingsResponse(s.getTheme(), s.getLanguage(), s.isSoundEnabled(),
                s.getLastSyncedAt(), s.isSheetsConnected(), s.getVersion());
    }

    @Transactional
    public ApiDtos.SettingsResponse updateSettings(ApiDtos.SettingsPatch patch) {
        var s = settings.findById(1L).orElseGet(() -> settings.save(new AppSettingsEntity()));
        if (patch.theme() != null) s.setTheme(patch.theme());
        if (patch.language() != null) s.setLanguage(patch.language());
        if (patch.soundEnabled() != null) s.setSoundEnabled(patch.soundEnabled());
        if (patch.lastSyncedAt() != null) s.setLastSyncedAt(patch.lastSyncedAt());
        settings.save(s);
        return getSettings();
    }

    public List<ApiDtos.OrderResponse> getOrders() {
        return orders.findAllByOrderByCreatedAtDesc().stream().map(this::order).toList();
    }

    /**
     * One JVM process serves the expo, so synchronizing this critical section
     * prevents two simultaneous LAN requests from allocating the same order number.
     * SQLite WAL + the transaction below protect the database write itself.
     */
    @Transactional
    public synchronized ApiDtos.OrderResponse createOrder(ApiDtos.CreateOrderRequest req) {
        validatePayment(req.paymentMethod());
        if (req.items() == null || req.items().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // Offline clients may retry the same order after a response was lost.
        if (req.clientOrderId() != null && !req.clientOrderId().isBlank()) {
            var existing = orders.findByClientOrderId(req.clientOrderId().trim());
            if (existing.isPresent()) return order(existing.get());
        }

        // Aggregate quantities first. This prevents a duplicate product line from
        // bypassing the stock check.
        Map<String, Integer> requestedByProduct = new LinkedHashMap<>();
        for (var item : req.items()) {
            requestedByProduct.merge(item.productId(), item.quantity(), Integer::sum);
        }

        Map<String, Product> dbProducts = new LinkedHashMap<>();
        for (var entry : requestedByProduct.entrySet()) {
            Product p = products.findById(entry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + entry.getKey()));
            if (!p.isActive()) {
                throw new IllegalArgumentException("Product is inactive: " + p.getName());
            }
            if (p.getStock() < entry.getValue()) {
                throw new IllegalArgumentException("Insufficient stock for " + p.getName()
                        + " (available: " + p.getStock() + ")");
            }
            dbProducts.put(entry.getKey(), p);
        }

        BigDecimal calculated = BigDecimal.ZERO;
        for (var item : req.items()) {
            BigDecimal effective = item.salePrice() != null ? item.salePrice() : item.price();
            if (effective.signum() < 0) throw new IllegalArgumentException("Sale price cannot be negative");
            calculated = calculated.add(effective.multiply(BigDecimal.valueOf(item.quantity())));
        }

        if (calculated.compareTo(req.total()) != 0) {
            throw new IllegalArgumentException("Order total does not match line items");
        }

        String id = UUID.randomUUID().toString();
        String number = nextOrderNumber();
        OrderEntity entity = new OrderEntity(
                id, number, req.total(), req.paymentMethod(), blankToNull(req.customerName()),
                blankToNull(req.notes()), "completed", Instant.now(), true,
                blankToNull(req.clientOrderId()));

        for (var item : req.items()) {
            Product p = dbProducts.get(item.productId());
            entity.addItem(new OrderItemEntity(
                    p.getId(), p.getName(), p.getPrice(), item.salePrice(),
                    item.quantity(), p.getImageUrl()));
        }

        // Inventory is changed only after all validation succeeds.
        for (var entry : requestedByProduct.entrySet()) {
            Product p = dbProducts.get(entry.getKey());
            p.setStock(p.getStock() - entry.getValue());
            p.setSoldCount(p.getSoldCount() + entry.getValue());
        }

        OrderEntity saved = orders.save(entity);
        String operator = blankToNull(req.operatorName());
        publishAfterCommit(new ApiDtos.PosEvent(
                UUID.randomUUID().toString(), "SALE_COMPLETED",
                (operator == null ? "A staff member" : operator) + " completed order " + saved.getOrderNumber()
                        + " · " + saved.getTotal() + " · " + saved.getPaymentMethod().toUpperCase(Locale.ROOT),
                Instant.now().toString(), operator, saved.getOrderNumber(), saved.getTotal(), saved.getPaymentMethod(),
                saved.getCustomerName(), null, null, null, null));

        for (var entry : requestedByProduct.entrySet()) {
            Product p = dbProducts.get(entry.getKey());
            int stock = p.getStock();
            if (stock == 0) {
                publishAfterCommit(new ApiDtos.PosEvent(UUID.randomUUID().toString(), "PRODUCT_OUT_OF_STOCK",
                        p.getName() + " is now out of stock", Instant.now().toString(), operator, saved.getOrderNumber(),
                        saved.getTotal(), saved.getPaymentMethod(), saved.getCustomerName(), p.getId(), p.getName(), stock, lowStockThreshold));
            } else if (stock <= lowStockThreshold) {
                publishAfterCommit(new ApiDtos.PosEvent(UUID.randomUUID().toString(), "PRODUCT_LOW_STOCK",
                        p.getName() + " has " + stock + " left", Instant.now().toString(), operator, saved.getOrderNumber(),
                        saved.getTotal(), saved.getPaymentMethod(), saved.getCustomerName(), p.getId(), p.getName(), stock, lowStockThreshold));
            }
        }
        return order(saved);
    }

    private void validatePayment(String m) {
        if (!Set.of("cash", "upi", "card", "qr").contains(m)) {
            throw new IllegalArgumentException("Unsupported payment method: " + m);
        }
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String nextOrderNumber() {
        long max = orders.findAll().stream()
                .map(OrderEntity::getOrderNumber)
                .mapToLong(s -> {
                    try { return Long.parseLong(s.replace("#", "")); }
                    catch (Exception e) { return 0; }
                })
                .max().orElse(0);
        return "#" + (max + 1);
    }

    private ApiDtos.OrderResponse order(OrderEntity o) {
        return new ApiDtos.OrderResponse(
                o.getId(), o.getOrderNumber(),
                o.getItems().stream()
                        .map(i -> new ApiDtos.OrderItemResponse(i.getProductId(), i.getProductName(),
                                i.getPrice(), i.getSalePrice(), i.getQuantity(), i.getImageUrl()))
                        .toList(),
                o.getTotal(), o.getPaymentMethod(), o.getCustomerName(), o.getNotes(),
                o.getStatus(), o.getCreatedAt(), o.isSynced());
    }

    public ApiDtos.DashboardResponse dashboard() {
        LocalDate today = LocalDate.now();
        List<OrderEntity> todayOrders = ordersForDay(today);
        List<OrderEntity> yesterday = ordersForDay(today.minusDays(1));
        BigDecimal revenue = sum(todayOrders);
        BigDecimal yesterdayRevenue = sum(yesterday);
        double orderChange = pct(todayOrders.size(), yesterday.size());
        double revChange = pct(revenue, yesterdayRevenue);
        BigDecimal avg = todayOrders.isEmpty() ? BigDecimal.ZERO : revenue.divide(BigDecimal.valueOf(todayOrders.size()), 2, RoundingMode.HALF_UP);
        BigDecimal yavg = yesterday.isEmpty() ? BigDecimal.ZERO : yesterdayRevenue.divide(BigDecimal.valueOf(yesterday.size()), 2, RoundingMode.HALF_UP);
        List<ApiDtos.PaymentAmount> split = List.of("cash", "upi", "card", "qr").stream()
                .map(m -> new ApiDtos.PaymentAmount(m, todayOrders.stream()
                        .filter(o -> o.getPaymentMethod().equals(m)).map(OrderEntity::getTotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))).toList();
        return new ApiDtos.DashboardResponse(revenue, revChange, todayOrders.size(), orderChange, avg,
                pct(avg, yavg), split, orders.findAllByOrderByCreatedAtDesc().stream().limit(5).map(this::order).toList(), 0);
    }

    public ApiDtos.AnalyticsResponse analytics() {
        LocalDate today = LocalDate.now();
        List<OrderEntity> current = ordersBetween(today.minusDays(6), today.plusDays(1));
        List<OrderEntity> previous = ordersBetween(today.minusDays(13), today.minusDays(6));
        BigDecimal revenue = sum(current);
        BigDecimal prevRevenue = sum(previous);
        long count = current.size();
        long prevCount = previous.size();
        BigDecimal profit = BigDecimal.ZERO;
        Map<String, Long> units = new HashMap<>();
        Map<String, BigDecimal> revByProduct = new HashMap<>();
        for (OrderEntity o : current) {
            for (OrderItemEntity i : o.getItems()) {
                BigDecimal sale = i.getSalePrice() != null ? i.getSalePrice() : i.getPrice();
                Product p = products.findById(i.getProductId()).orElse(null);
                BigDecimal cost = p == null ? i.getPrice() : p.getCostPrice();
                profit = profit.add(sale.subtract(cost).multiply(BigDecimal.valueOf(i.getQuantity())));
                units.merge(i.getProductId(), (long) i.getQuantity(), Long::sum);
                revByProduct.merge(i.getProductId(), sale.multiply(BigDecimal.valueOf(i.getQuantity())), BigDecimal::add);
            }
        }
        BigDecimal avg = count == 0 ? BigDecimal.ZERO : revenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
        List<ApiDtos.PaymentPercent> payment = List.of("upi", "cash", "card", "qr").stream()
                .map(m -> new ApiDtos.PaymentPercent(m, revenue.signum() == 0 ? 0 : current.stream()
                        .filter(o -> o.getPaymentMethod().equals(m)).map(OrderEntity::getTotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add).divide(revenue, 4, RoundingMode.HALF_UP).doubleValue() * 100)).toList();
        List<ApiDtos.TopProduct> top = units.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()).limit(5)
                .map(e -> products.findById(e.getKey())
                        .map(p -> new ApiDtos.TopProduct(product(p), e.getValue(), revByProduct.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                        .orElse(null)).filter(Objects::nonNull).toList();
        List<ApiDtos.WeeklyRevenue> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            weekly.add(new ApiDtos.WeeklyRevenue(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), sum(ordersForDay(d))));
        }
        BigDecimal prevProfit = estimateProfit(previous);
        return new ApiDtos.AnalyticsResponse(revenue, count, profit, avg, pct(revenue, prevRevenue),
                pct(count, prevCount), pct(profit, prevProfit), payment, top, weekly);
    }

    private BigDecimal estimateProfit(List<OrderEntity> os) {
        BigDecimal p = BigDecimal.ZERO;
        for (OrderEntity o : os) for (OrderItemEntity i : o.getItems()) {
            Product pr = products.findById(i.getProductId()).orElse(null);
            BigDecimal sale = i.getSalePrice() != null ? i.getSalePrice() : i.getPrice();
            BigDecimal cost = pr == null ? i.getPrice() : pr.getCostPrice();
            p = p.add(sale.subtract(cost).multiply(BigDecimal.valueOf(i.getQuantity())));
        }
        return p;
    }

    private List<OrderEntity> ordersForDay(LocalDate d) { return ordersBetween(d, d.plusDays(1)); }

    private List<OrderEntity> ordersBetween(LocalDate from, LocalDate to) {
        ZoneId z = ZoneId.systemDefault();
        return orders.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                from.atStartOfDay(z).toInstant(), to.atStartOfDay(z).toInstant());
    }

    private BigDecimal sum(List<OrderEntity> os) {
        return os.stream().map(OrderEntity::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double pct(double a, double b) { return b == 0 ? (a == 0 ? 0 : 100) : ((a - b) / b) * 100; }
    private double pct(BigDecimal a, BigDecimal b) { return pct(a.doubleValue(), b.doubleValue()); }

    @Transactional
    public ApiDtos.CategoryResponse createCategory(ApiDtos.CategoryInput input) {
        String name = input.name().trim();
        if (name.isEmpty()) throw new IllegalArgumentException("Category name required");
        Category c = categories.save(new Category(UUID.randomUUID().toString(), name, input.nameJa(),
                input.icon() == null ? "package" : input.icon()));
        return new ApiDtos.CategoryResponse(c.getId(), c.getName(), c.getNameJa(), c.getIcon(), 0);
    }

    @Transactional
    public ApiDtos.ProductResponse createProduct(ApiDtos.ProductInput input) {
        Category c = categories.findById(input.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        Product p = new Product(UUID.randomUUID().toString(), input.name().trim(), input.nameJa(), c,
                input.price().doubleValue(), input.costPrice() == null ? 0 : input.costPrice().doubleValue(),
                input.stock(), input.imageUrl() == null ? "" : input.imageUrl(), input.description(), 0);
        Product saved = products.save(p);
        publishAfterCommit(new ApiDtos.PosEvent(UUID.randomUUID().toString(), "PRODUCT_CREATED",
                "New product added: " + saved.getName(), Instant.now().toString(), null, null, null, null, null,
                saved.getId(), saved.getName(), saved.getStock(), lowStockThreshold));
        return product(saved);
    }

    @Transactional
    public ApiDtos.ProductResponse updateProduct(String id, ApiDtos.ProductInput input) {
        Product p = products.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        Category c = categories.findById(input.categoryId()).orElseThrow(() -> new IllegalArgumentException("Category not found"));
        p.update(input.name().trim(), input.nameJa(), c, input.price(),
                input.costPrice() == null ? BigDecimal.ZERO : input.costPrice(), input.stock(),
                input.imageUrl() == null ? "" : input.imageUrl(), input.description());
        Product saved = products.save(p);
        publishAfterCommit(new ApiDtos.PosEvent(UUID.randomUUID().toString(), "PRODUCT_UPDATED",
                "Product updated: " + saved.getName() + " · stock " + saved.getStock(), Instant.now().toString(), null, null, null, null, null,
                saved.getId(), saved.getName(), saved.getStock(), lowStockThreshold));
        if (saved.getStock() == 0) {
            publishAfterCommit(new ApiDtos.PosEvent(UUID.randomUUID().toString(), "PRODUCT_OUT_OF_STOCK",
                    saved.getName() + " is out of stock", Instant.now().toString(), null, null, null, null, null,
                    saved.getId(), saved.getName(), saved.getStock(), lowStockThreshold));
        }else if (saved.getStock() <= lowStockThreshold) {
            publishAfterCommit(
                    new ApiDtos.PosEvent(
                            UUID.randomUUID().toString(),
                            "PRODUCT_LOW_STOCK",
                            saved.getName() + " has " + saved.getStock() + " left",
                            Instant.now().toString(),
                            null,
                            null,
                            null,
                            null,
                            saved.getId(),
                            saved.getName(),
                            null,
                            saved.getStock(),
                            lowStockThreshold
                    )
            );
        }
        return product(saved);
    }

    @Transactional
    public void deleteProduct(String id) {
        Product p = products.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        // Soft-delete so historical order items and analytics remain valid.
        p.setActive(false);
        products.save(p);
        publishAfterCommit(new ApiDtos.PosEvent(UUID.randomUUID().toString(), "PRODUCT_DELETED",
                "Product deleted: " + p.getName(), Instant.now().toString(), null, null, null, null, null,
                p.getId(), p.getName(), p.getStock(), lowStockThreshold));
    }

    private void publishAfterCommit(ApiDtos.PosEvent event) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { realtimeEvents.publish(event); }
            });
        } else {
            realtimeEvents.publish(event);
        }
    }

    private void requireAdmin(String password) {
        if (password == null || !java.security.MessageDigest.isEqual(
                adminPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                password.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            throw new com.expo.sales.exception.AdminAuthenticationException();
        }
    }

    @Transactional
    public ApiDtos.ProductResponse createProduct(String password, ApiDtos.ProductInput input) {
        requireAdmin(password);
        return createProduct(input);
    }

    @Transactional
    public ApiDtos.ProductResponse updateProduct(String password, String id, ApiDtos.ProductInput input) {
        requireAdmin(password);
        return updateProduct(id, input);
    }

    @Transactional
    public void deleteProduct(String password, String id) {
        requireAdmin(password);
        deleteProduct(id);
    }
}
