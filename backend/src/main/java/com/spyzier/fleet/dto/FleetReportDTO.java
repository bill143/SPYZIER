package com.spyzier.fleet.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetReportDTO {

    private LocalDateTime generatedAt;
    private String reportPeriod;
    private long totalVehicles;
    private long activeVehicles;
    private long totalTelemetryRecords;
    private long totalAlerts;
    private long totalMaintenanceRecords;
    private double averageFleetSpeed;
    private double totalDistanceCovered;
    private List<VehicleDTO> vehicleSummaries;
    private List<AlertDTO> recentAlerts;
    private List<MaintenanceDTO> upcomingMaintenance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverActivityEntry {
        private String driverName;
        private String employeeId;
        private long totalTrips;
        private double totalDistance;
        private double averageSpeed;
        private long alertsGenerated;
    }
}
