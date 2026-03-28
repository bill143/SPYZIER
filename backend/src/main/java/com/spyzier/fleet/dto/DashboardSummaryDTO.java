package com.spyzier.fleet.dto;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    private long totalVehicles;
    private long activeVehicles;
    private long inactiveVehicles;
    private long vehiclesInMaintenance;
    private long offlineVehicles;
    private long totalDrivers;
    private long driversOnDuty;
    private long unacknowledgedAlerts;
    private long criticalAlerts;
    private long maintenanceDue;
    private long maintenanceOverdue;
    private Map<String, Long> alertsByType;
    private Map<String, Long> vehiclesByType;
}
