package com.expo.sales.repository;
import com.expo.sales.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
public interface OrderRepository extends JpaRepository<OrderEntity,String> {
    List<OrderEntity> findAllByOrderByCreatedAtDesc();
    Optional<OrderEntity> findTopByOrderByOrderNumberDesc();
    Optional<OrderEntity> findByClientOrderId(String clientOrderId);
    List<OrderEntity> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant from, Instant to);
}
