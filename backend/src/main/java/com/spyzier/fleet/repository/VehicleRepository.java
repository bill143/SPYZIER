package com.spyzier.fleet.repository;

import com.spyzier.fleet.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByVehicleId(String vehicleId);

    boolean existsByVehicleId(String vehicleId);

    boolean existsByLicensePlate(String licensePlate);

    boolean existsByVin(String vin);

    List<Vehicle> findByTenantId(String tenantId);

    Page<Vehicle> findByTenantId(String tenantId, Pageable pageable);

    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);

    List<Vehicle> findByTenantIdAndStatus(String tenantId, Vehicle.VehicleStatus status);

    long countByStatus(Vehicle.VehicleStatus status);

    long countByTenantId(String tenantId);

    @Query("SELECT v FROM Vehicle v WHERE v.tenantId = :tenantId AND v.status = :status")
    List<Vehicle> findByTenantIdAndStatus(@Param("tenantId") String tenantId,
                                          @Param("status") String status);

    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.status = 'ACTIVE'")
    long countActiveVehicles();
}
