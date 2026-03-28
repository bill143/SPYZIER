package com.spyzier.fleet.repository;

import com.spyzier.fleet.model.GeoFence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeoFenceRepository extends JpaRepository<GeoFence, Long> {

    List<GeoFence> findByTenantId(String tenantId);

    List<GeoFence> findByActiveTrue();

    List<GeoFence> findByTenantIdAndActiveTrue(String tenantId);

    boolean existsByNameAndTenantId(String name, String tenantId);
}
