package com.spyzier.fleet.repository;

import com.spyzier.fleet.model.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByVehicleId(String vehicleId);

    Page<Alert> findByVehicleId(String vehicleId, Pageable pageable);

    List<Alert> findByAcknowledgedFalse();

    Page<Alert> findByAcknowledgedFalse(Pageable pageable);

    List<Alert> findByVehicleIdAndAcknowledgedFalse(String vehicleId);

    List<Alert> findBySeverity(Alert.AlertSeverity severity);

    List<Alert> findByType(Alert.AlertType type);

    @Query("SELECT a FROM Alert a WHERE a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    List<Alert> findByTimestampBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByAcknowledgedFalse();

    long countBySeverityAndAcknowledgedFalse(Alert.AlertSeverity severity);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.acknowledged = false AND a.severity IN ('HIGH', 'CRITICAL')")
    long countCriticalUnacknowledged();
}
