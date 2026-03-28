package com.spyzier.fleet.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
        @Index(name = "idx_alerts_vehicle_id", columnList = "vehicle_id"),
        @Index(name = "idx_alerts_timestamp", columnList = "timestamp"),
        @Index(name = "idx_alerts_acknowledged", columnList = "acknowledged"),
        @Index(name = "idx_alerts_severity", columnList = "severity")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", length = 50)
    private String vehicleId;

    @Column(name = "driver_id")
    private Long driverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AlertType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AlertSeverity severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    @Builder.Default
    private boolean acknowledged = false;

    @Column(name = "acknowledged_by", length = 100)
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public enum AlertType {
        SPEEDING, GEOFENCE_BREACH, LOW_FUEL, ENGINE_FAULT,
        MAINTENANCE_DUE, OFFLINE, ACCIDENT
    }

    public enum AlertSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
