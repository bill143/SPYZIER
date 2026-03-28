package com.spyzier.fleet.dto;

import com.spyzier.fleet.model.MaintenanceRecord;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceDTO {

    private Long id;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotNull(message = "Maintenance type is required")
    private MaintenanceRecord.MaintenanceType type;

    private String description;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private BigDecimal cost;
    private String technician;
    private MaintenanceRecord.MaintenanceStatus status;
    private Double mileageAtService;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
