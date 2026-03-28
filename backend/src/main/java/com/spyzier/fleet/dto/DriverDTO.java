package com.spyzier.fleet.dto;

import com.spyzier.fleet.model.Driver;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDTO {

    private Long id;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private LocalDate licenseExpiry;
    private String phone;
    private String email;
    private Driver.DriverStatus status;
    private Long vehicleId;
    private String tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
