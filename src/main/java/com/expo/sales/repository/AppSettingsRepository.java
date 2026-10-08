package com.expo.sales.repository;
import com.expo.sales.entity.AppSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AppSettingsRepository extends JpaRepository<AppSettingsEntity,Long> {}
