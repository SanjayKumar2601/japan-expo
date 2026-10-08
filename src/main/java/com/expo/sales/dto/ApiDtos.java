package com.expo.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class ApiDtos {
    private ApiDtos() {}
    public record CategoryInput(@NotBlank String name,String nameJa,String icon) {}
    public record ProductInput(@NotBlank String name,String nameJa,@NotBlank String categoryId,@NotNull @PositiveOrZero BigDecimal price,@PositiveOrZero BigDecimal costPrice,@Min(0) int stock,String imageUrl,String description) {}
    public record CategoryResponse(String id,String name,String nameJa,String icon,long itemCount) {}
    public record ProductResponse(String id,String name,String nameJa,String categoryId,String categoryName,BigDecimal price,int stock,String imageUrl,String description,boolean isFavorite,int soldCount) {}
    public record OrderItemRequest(@NotBlank String productId,@NotBlank String productName,@NotNull @PositiveOrZero BigDecimal price,@PositiveOrZero BigDecimal salePrice,@Min(1) int quantity,String imageUrl) {}
    public record CreateOrderRequest(@NotEmpty List<@Valid OrderItemRequest> items,@NotNull @PositiveOrZero BigDecimal total,@NotBlank String paymentMethod,@Size(max=60) String customerName,@Size(max=220) String notes,@Size(max=120) String clientOrderId,@Size(max=80) String operatorName) {}
    public record OrderItemResponse(String productId,String productName,BigDecimal price,BigDecimal salePrice,int quantity,String imageUrl) {}
    public record OrderResponse(String id,String orderNumber,List<OrderItemResponse> items,BigDecimal total,String paymentMethod,String customerName,String notes,String status,Instant createdAt,boolean synced) {}
    public record PaymentAmount(String method,BigDecimal amount) {}
    public record PaymentPercent(String method,double percent) {}
    public record DashboardResponse(BigDecimal revenueToday,double revenueChangePercent,long ordersToday,double ordersChangePercent,BigDecimal avgOrderValue,double avgOrderChangePercent,List<PaymentAmount> paymentSplit,List<OrderResponse> recentOrders,long pendingSyncCount) {}
    public record TopProduct(ProductResponse product,long unitsSold,BigDecimal revenue) {}
    public record WeeklyRevenue(String day,BigDecimal revenue) {}
    public record AnalyticsResponse(BigDecimal revenue,long orders,BigDecimal profit,BigDecimal avgOrderValue,double revenueChangePercent,double ordersChangePercent,double profitChangePercent,List<PaymentPercent> paymentSplit,List<TopProduct> topProducts,List<WeeklyRevenue> weeklyRevenue) {}
    public record SettingsResponse(String theme,String language,boolean soundEnabled,String lastSyncedAt,boolean sheetsConnected,String version) {}
    public record SettingsPatch(String theme,String language,Boolean soundEnabled,String lastSyncedAt) {}
    public record PosEvent(String id,String type,String message,String createdAt,String operatorName,String orderNumber,BigDecimal total,String paymentMethod,String customerName,String productId,String productName,Integer stock,Integer lowStockThreshold) {}
}
