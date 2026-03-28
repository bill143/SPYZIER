package com.spyzier.fleet.repository;

import com.spyzier.fleet.model.Telemetry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {

    Page<Telemetry> findByVehicleIdOrderByTimestampDesc(String vehicleId, Pageable pageable);

    List<Telemetry> findByVehicleIdAndTimestampBetweenOrderByTimestampDesc(
            String vehicleId, LocalDateTime start, LocalDateTime end);

    Optional<Telemetry> findTopByVehicleIdOrderByTimestampDesc(String vehicleId);

    @Query("SELECT t FROM Telemetry t WHERE t.vehicleId = :vehicleId ORDER BY t.timestamp DESC")
    List<Telemetry> findLatestByVehicleId(@Param("vehicleId") String vehicleId, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Telemetry t WHERE t.timestamp = " +
           "(SELECT MAX(t2.timestamp) FROM Telemetry t2 WHERE t2.vehicleId = t.vehicleId)")
    List<Telemetry> findLatestPerVehicle();

    void deleteByVehicleId(String vehicleId);

    long countByVehicleId(String vehicleId);
}
