package com.spyzier.fleet.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicles_vehicle_id", columnList = "vehicle_id"),
        @Index(name = "idx_vehicles_tenant_id", columnList = "tenant_id"),
        @Index(name = "idx_vehicles_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false, unique = true, length = 50)
    private String vehicleId;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleType type;

    @Column(length = 50)
    private String make;

    @Column(length = 50)
    private String model;

    @Column
    private Integer year;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Column(length = 17)
    private String vin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.ACTIVE;

    @Column(name = "current_driver_id")
    private Long currentDriverId;

    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    @Column(name = "fuel_level")
    private Double fuelLevel;

    @Column(name = "engine_status", length = 20)
    private String engineStatus;

    @Column(name = "odometer")
    private Double odometer;

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

    public enum VehicleType {
        TRUCK, VAN, CAR, MOTORCYCLE, HEAVY_MACHINERY
    }

    public enum VehicleStatus {
        ACTIVE, INACTIVE, MAINTENANCE, OFFLINE
    }
}
