package com.spyzier.fleet.repository;

import com.spyzier.fleet.model.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByEmployeeId(String employeeId);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    boolean existsByLicenseNumber(String licenseNumber);

    List<Driver> findByTenantId(String tenantId);

    Page<Driver> findByTenantId(String tenantId, Pageable pageable);

    List<Driver> findByStatus(Driver.DriverStatus status);

    List<Driver> findByTenantIdAndStatus(String tenantId, Driver.DriverStatus status);

    Optional<Driver> findByVehicleId(Long vehicleId);

    long countByStatus(Driver.DriverStatus status);
}
