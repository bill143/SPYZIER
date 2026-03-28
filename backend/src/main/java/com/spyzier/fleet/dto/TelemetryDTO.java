package com.spyzier.fleet.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryDTO {

    private Long id;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    private LocalDateTime timestamp;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Double speed;
    private Double heading;
    private Double altitude;
    private Double fuelLevel;
    private Double engineTemp;
    private Double oilPressure;
    private Double batteryVoltage;
    private Double rpm;
    private Double odometer;
    private Boolean ignitionStatus;
    private String engineStatus;
    private String rawData;
}
