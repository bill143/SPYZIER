package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.*;
import com.spyzier.fleet.model.MaintenanceRecord;
import com.spyzier.fleet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TelemetryRepository telemetryRepository;
    private final AlertRepository alertRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final VehicleService vehicleService;
    private final AlertService alertService;
    private final MaintenanceService maintenanceService;
    private final DriverService driverService;

    @Transactional(readOnly = true)
    public FleetReportDTO generateFleetReport(LocalDate from, LocalDate to) {
        LocalDateTime fromDT = from.atStartOfDay();
        LocalDateTime toDT = to.plusDays(1).atStartOfDay();

        long totalVehicles = vehicleRepository.count();
        long activeVehicles = vehicleRepository.countActiveVehicles();
        long totalTelemetry = telemetryRepository.count();
        long totalAlerts = alertRepository.count();
        long totalMaintenance = maintenanceRepository.count();

        List<VehicleDTO> vehicleSummaries = vehicleRepository.findAll().stream()
                .map(vehicleService::toDTO)
                .collect(Collectors.toList());

        List<AlertDTO> recentAlerts = alertRepository.findByTimestampBetween(fromDT, toDT).stream()
                .map(alertService::toDTO)
                .limit(50)
                .collect(Collectors.toList());

        List<MaintenanceDTO> upcomingMaintenance = maintenanceRepository.findUpcoming(LocalDate.now().plusDays(30))
                .stream()
                .map(maintenanceService::toDTO)
                .collect(Collectors.toList());

        return FleetReportDTO.builder()
                .generatedAt(LocalDateTime.now())
                .reportPeriod(from + " to " + to)
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .totalTelemetryRecords(totalTelemetry)
                .totalAlerts(totalAlerts)
                .totalMaintenanceRecords(totalMaintenance)
                .vehicleSummaries(vehicleSummaries)
                .recentAlerts(recentAlerts)
                .upcomingMaintenance(upcomingMaintenance)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> generateMaintenanceReport(LocalDate from, LocalDate to) {
        return maintenanceRepository.findByScheduledDateBetween(from, to).stream()
                .map(maintenanceService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DriverDTO> generateDriverActivityReport() {
        return driverRepository.findAll().stream()
                .map(driverService::toDTO)
                .collect(Collectors.toList());
    }
}
