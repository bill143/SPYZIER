package com.spyzier.fleet.repository;

import com.spyzier.fleet.model.MaintenanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord, Long> {

    List<MaintenanceRecord> findByVehicleId(String vehicleId);

    Page<MaintenanceRecord> findByVehicleId(String vehicleId, Pageable pageable);

    List<MaintenanceRecord> findByStatus(MaintenanceRecord.MaintenanceStatus status);

    List<MaintenanceRecord> findByVehicleIdAndStatus(String vehicleId, MaintenanceRecord.MaintenanceStatus status);

    @Query("SELECT m FROM MaintenanceRecord m WHERE m.scheduledDate <= :date AND m.status = 'SCHEDULED'")
    List<MaintenanceRecord> findUpcoming(@Param("date") LocalDate date);

    @Query("SELECT m FROM MaintenanceRecord m WHERE m.scheduledDate < :today AND m.status = 'SCHEDULED'")
    List<MaintenanceRecord> findOverdue(@Param("today") LocalDate today);

    @Query("SELECT m FROM MaintenanceRecord m WHERE m.scheduledDate BETWEEN :start AND :end AND m.status = 'SCHEDULED'")
    List<MaintenanceRecord> findByScheduledDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    long countByStatus(MaintenanceRecord.MaintenanceStatus status);

    @Query("SELECT COUNT(m) FROM MaintenanceRecord m WHERE m.scheduledDate < :today AND m.status = 'SCHEDULED'")
    long countOverdue(@Param("today") LocalDate today);
}
