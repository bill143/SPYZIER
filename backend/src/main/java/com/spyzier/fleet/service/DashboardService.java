package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.DashboardSummaryDTO;
import com.spyzier.fleet.model.Alert;
import com.spyzier.fleet.model.Driver;
import com.spyzier.fleet.model.Vehicle;
import com.spyzier.fleet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final AlertRepository alertRepository;
    private final MaintenanceRepository maintenanceRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'summary'")
    public DashboardSummaryDTO getFleetSummary() {
        long totalVehicles = vehicleRepository.count();
        long activeVehicles = vehicleRepository.countByStatus(Vehicle.VehicleStatus.ACTIVE);
        long inactiveVehicles = vehicleRepository.countByStatus(Vehicle.VehicleStatus.INACTIVE);
        long maintenanceVehicles = vehicleRepository.countByStatus(Vehicle.VehicleStatus.MAINTENANCE);
        long offlineVehicles = vehicleRepository.countByStatus(Vehicle.VehicleStatus.OFFLINE);

        long totalDrivers = driverRepository.count();
        long driversOnDuty = driverRepository.countByStatus(Driver.DriverStatus.ON_DUTY);

        long unacknowledgedAlerts = alertRepository.countByAcknowledgedFalse();
        long criticalAlerts = alertRepository.countCriticalUnacknowledged();

        long maintenanceDue = maintenanceRepository.countByStatus(
                com.spyzier.fleet.model.MaintenanceRecord.MaintenanceStatus.SCHEDULED);
        long maintenanceOverdue = maintenanceRepository.countOverdue(LocalDate.now());

        Map<String, Long> alertsByType = new HashMap<>();
        for (Alert.AlertType type : Alert.AlertType.values()) {
            long count = alertRepository.findByType(type).size();
            alertsByType.put(type.name(), count);
        }

        Map<String, Long> vehiclesByType = new HashMap<>();
        for (Vehicle.VehicleType type : Vehicle.VehicleType.values()) {
            long count = vehicleRepository.findAll().stream()
                    .filter(v -> v.getType() == type)
                    .count();
            vehiclesByType.put(type.name(), count);
        }

        return DashboardSummaryDTO.builder()
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .inactiveVehicles(inactiveVehicles)
                .vehiclesInMaintenance(maintenanceVehicles)
                .offlineVehicles(offlineVehicles)
                .totalDrivers(totalDrivers)
                .driversOnDuty(driversOnDuty)
                .unacknowledgedAlerts(unacknowledgedAlerts)
                .criticalAlerts(criticalAlerts)
                .maintenanceDue(maintenanceDue)
                .maintenanceOverdue(maintenanceOverdue)
                .alertsByType(alertsByType)
                .vehiclesByType(vehiclesByType)
                .build();
    }
}
