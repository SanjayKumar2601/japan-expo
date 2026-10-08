package com.expo.sales.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="order_items")
public class OrderItemEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="order_id") private OrderEntity order;
    @Column(nullable=false) private String productId;
    @Column(nullable=false) private String productName;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal price;
    @Column(precision=12, scale=2) private BigDecimal salePrice;
    @Column(nullable=false) private int quantity;
    @Column(nullable=false) private String imageUrl;

    protected OrderItemEntity() {}
    public OrderItemEntity(String productId,String productName,BigDecimal price,BigDecimal salePrice,int quantity,String imageUrl){this.productId=productId;this.productName=productName;this.price=price;this.salePrice=salePrice;this.quantity=quantity;this.imageUrl=imageUrl;}
    void setOrder(OrderEntity order){this.order=order;}
    public String getProductId(){return productId;} public String getProductName(){return productName;} public BigDecimal getPrice(){return price;} public BigDecimal getSalePrice(){return salePrice;} public int getQuantity(){return quantity;} public String getImageUrl(){return imageUrl;}
}
