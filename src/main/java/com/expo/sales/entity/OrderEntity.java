package com.expo.sales.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="orders", indexes={@Index(name="idx_orders_created",columnList="createdAt"),@Index(name="idx_orders_number",columnList="orderNumber")})
public class OrderEntity {
    @Id @Column(length=80) private String id;
    @Column(nullable=false, unique=true) private String orderNumber;
    @Column(unique=true, length=120) private String clientOrderId;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal total;
    @Column(nullable=false) private String paymentMethod;
    private String customerName;
    @Column(length=500) private String notes;
    @Column(nullable=false) private String status;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private boolean synced;
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true, fetch=FetchType.EAGER)
    private List<OrderItemEntity> items = new ArrayList<>();

    protected OrderEntity() {}
    public OrderEntity(String id,String orderNumber,BigDecimal total,String paymentMethod,String customerName,String notes,String status,Instant createdAt,boolean synced,String clientOrderId){this.id=id;this.orderNumber=orderNumber;this.total=total;this.paymentMethod=paymentMethod;this.customerName=customerName;this.notes=notes;this.status=status;this.createdAt=createdAt;this.synced=synced;this.clientOrderId=clientOrderId;}
    public String getId(){return id;} public String getOrderNumber(){return orderNumber;} public String getClientOrderId(){return clientOrderId;} public BigDecimal getTotal(){return total;} public String getPaymentMethod(){return paymentMethod;} public String getCustomerName(){return customerName;} public String getNotes(){return notes;} public String getStatus(){return status;} public Instant getCreatedAt(){return createdAt;} public boolean isSynced(){return synced;} public List<OrderItemEntity> getItems(){return items;}
    public void addItem(OrderItemEntity item){items.add(item);item.setOrder(this);}
}
