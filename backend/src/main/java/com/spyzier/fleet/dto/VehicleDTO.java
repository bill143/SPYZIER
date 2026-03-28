package com.spyzier.fleet.dto;

import com.spyzier.fleet.model.Vehicle;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {

    private Long id;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Vehicle name is required")
    private String name;

    @NotNull(message = "Vehicle type is required")
    private Vehicle.VehicleType type;

    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private String vin;
    private Vehicle.VehicleStatus status;
    private Long currentDriverId;
    private String tenantId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastLocationUpdate;
    private Double fuelLevel;
    private String engineStatus;
    private Double odometer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
