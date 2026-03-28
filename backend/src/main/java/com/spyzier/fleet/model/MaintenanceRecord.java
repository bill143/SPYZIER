package com.spyzier.fleet.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records", indexes = {
        @Index(name = "idx_maintenance_vehicle_id", columnList = "vehicle_id"),
        @Index(name = "idx_maintenance_status", columnList = "status"),
        @Index(name = "idx_maintenance_scheduled_date", columnList = "scheduled_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false, length = 50)
    private String vehicleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenanceType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(length = 100)
    private String technician;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(name = "mileage_at_service")
    private Double mileageAtService;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum MaintenanceType {
        PREVENTIVE, CORRECTIVE, INSPECTION, EMERGENCY
    }

    public enum MaintenanceStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
