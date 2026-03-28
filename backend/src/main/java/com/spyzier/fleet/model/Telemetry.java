package com.spyzier.fleet.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry", indexes = {
        @Index(name = "idx_telemetry_vehicle_id_timestamp", columnList = "vehicle_id, timestamp"),
        @Index(name = "idx_telemetry_vehicle_id", columnList = "vehicle_id"),
        @Index(name = "idx_telemetry_timestamp", columnList = "timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Telemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false, length = 50)
    private String vehicleId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column
    private Double speed;

    @Column
    private Double heading;

    @Column
    private Double altitude;

    @Column(name = "fuel_level")
    private Double fuelLevel;

    @Column(name = "engine_temp")
    private Double engineTemp;

    @Column(name = "oil_pressure")
    private Double oilPressure;

    @Column(name = "battery_voltage")
    private Double batteryVoltage;

    @Column
    private Double rpm;

    @Column
    private Double odometer;

    @Column(name = "ignition_status")
    private Boolean ignitionStatus;

    @Column(name = "engine_status", length = 20)
    private String engineStatus;

    @Column(name = "raw_data", columnDefinition = "TEXT")
    private String rawData;
}
