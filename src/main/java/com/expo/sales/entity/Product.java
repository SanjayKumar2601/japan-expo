package com.expo.sales.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="products")
public class Product {
    @Id @Column(length=80) private String id;
    @Column(nullable=false) private String name;
    private String nameJa;
    @ManyToOne(fetch=FetchType.EAGER, optional=false) @JoinColumn(name="category_id") private Category category;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal price;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal costPrice;
    @Column(nullable=false) private int stock;
    @Column(nullable=false) private String imageUrl;
    @Column(length=1000) private String description;
    @Column(nullable=false) private int soldCount;
    @Column(nullable=false) private boolean active;

    protected Product() {}
    public void update(String name,String nameJa,Category category,BigDecimal price,BigDecimal costPrice,int stock,String imageUrl,String description){this.name=name;this.nameJa=nameJa;this.category=category;this.price=price;this.costPrice=costPrice;this.stock=stock;this.imageUrl=imageUrl;this.description=description;}
    public Product(String id,String name,String nameJa,Category category,double price,double costPrice,int stock,String imageUrl,String description,int soldCount){
        this.id=id;this.name=name;this.nameJa=nameJa;this.category=category;this.price=BigDecimal.valueOf(price);this.costPrice=BigDecimal.valueOf(costPrice);this.stock=stock;this.imageUrl=imageUrl;this.description=description;this.soldCount=soldCount;this.active=true;
    }
    public String getId(){return id;} public String getName(){return name;} public String getNameJa(){return nameJa;} public Category getCategory(){return category;} public BigDecimal getPrice(){return price;} public BigDecimal getCostPrice(){return costPrice;} public int getStock(){return stock;} public String getImageUrl(){return imageUrl;} public String getDescription(){return description;} public int getSoldCount(){return soldCount;} public boolean isActive(){return active;}
    public void setStock(int stock){this.stock=stock;} public void setSoldCount(int soldCount){this.soldCount=soldCount;} public void setActive(boolean active){this.active=active;}
}
