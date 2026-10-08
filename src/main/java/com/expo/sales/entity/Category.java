package com.expo.sales.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="categories")
public class Category {
    @Id @Column(length=80)
    private String id;
    @Column(nullable=false, length=120) private String name;
    private String nameJa;
    @Column(nullable=false, length=80) private String icon;

    protected Category() {}
    public Category(String id, String name, String nameJa, String icon) {
        this.id=id; this.name=name; this.nameJa=nameJa; this.icon=icon;
    }
    public String getId(){return id;} public String getName(){return name;} public String getNameJa(){return nameJa;} public String getIcon(){return icon;}
}
