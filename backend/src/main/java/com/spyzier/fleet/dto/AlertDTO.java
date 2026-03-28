package com.spyzier.fleet.dto;

import com.spyzier.fleet.model.Alert;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {

    private Long id;
    private String vehicleId;
    private Long driverId;
    private Alert.AlertType type;
    private Alert.AlertSeverity severity;
    private String message;
    private LocalDateTime timestamp;
    private boolean acknowledged;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private Double latitude;
    private Double longitude;
}
