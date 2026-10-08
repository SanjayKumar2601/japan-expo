package com.expo.sales.repository;
import com.expo.sales.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductRepository extends JpaRepository<Product,String> {}
