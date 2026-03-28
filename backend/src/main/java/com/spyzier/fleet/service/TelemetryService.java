package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.TelemetryDTO;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.Telemetry;
import com.spyzier.fleet.model.Vehicle;
import com.spyzier.fleet.repository.TelemetryRepository;
import com.spyzier.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final VehicleRepository vehicleRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @CachePut(value = "telemetry_latest", key = "#dto.vehicleId")
    public TelemetryDTO saveTelemetry(TelemetryDTO dto) {
        if (dto.getTimestamp() == null) {
            dto.setTimestamp(LocalDateTime.now());
        }

        Telemetry telemetry = fromDTO(dto);
        telemetry = telemetryRepository.save(telemetry);

        vehicleRepository.findByVehicleId(dto.getVehicleId()).ifPresent(vehicle -> {
            vehicle.setLatitude(dto.getLatitude());
            vehicle.setLongitude(dto.getLongitude());
            vehicle.setLastLocationUpdate(dto.getTimestamp());
            if (dto.getFuelLevel() != null) vehicle.setFuelLevel(dto.getFuelLevel());
            if (dto.getEngineStatus() != null) vehicle.setEngineStatus(dto.getEngineStatus());
            if (dto.getOdometer() != null) vehicle.setOdometer(dto.getOdometer());
            if (vehicle.getStatus() == Vehicle.VehicleStatus.OFFLINE) {
                vehicle.setStatus(Vehicle.VehicleStatus.ACTIVE);
            }
            vehicleRepository.save(vehicle);
        });

        TelemetryDTO savedDTO = toDTO(telemetry);
        broadcastTelemetry(dto.getVehicleId(), savedDTO);
        return savedDTO;
    }

    private void broadcastTelemetry(String vehicleId, TelemetryDTO dto) {
        try {
            messagingTemplate.convertAndSend("/topic/telemetry/" + vehicleId, dto);
        } catch (Exception e) {
            log.warn("Failed to broadcast telemetry for vehicle {}: {}", vehicleId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<TelemetryDTO> getTelemetryHistory(String vehicleId, Pageable pageable) {
        return telemetryRepository.findByVehicleIdOrderByTimestampDesc(vehicleId, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "telemetry_latest", key = "#vehicleId")
    public TelemetryDTO getLatestTelemetry(String vehicleId) {
        return telemetryRepository.findTopByVehicleIdOrderByTimestampDesc(vehicleId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Telemetry", "vehicleId", vehicleId));
    }

    @Transactional(readOnly = true)
    public List<TelemetryDTO> getTelemetryBetween(String vehicleId,
                                                   LocalDateTime start,
                                                   LocalDateTime end) {
        return telemetryRepository
                .findByVehicleIdAndTimestampBetweenOrderByTimestampDesc(vehicleId, start, end)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TelemetryDTO toDTO(Telemetry t) {
        return TelemetryDTO.builder()
                .id(t.getId())
                .vehicleId(t.getVehicleId())
                .timestamp(t.getTimestamp())
                .latitude(t.getLatitude())
                .longitude(t.getLongitude())
                .speed(t.getSpeed())
                .heading(t.getHeading())
                .altitude(t.getAltitude())
                .fuelLevel(t.getFuelLevel())
                .engineTemp(t.getEngineTemp())
                .oilPressure(t.getOilPressure())
                .batteryVoltage(t.getBatteryVoltage())
                .rpm(t.getRpm())
                .odometer(t.getOdometer())
                .ignitionStatus(t.getIgnitionStatus())
                .engineStatus(t.getEngineStatus())
                .rawData(t.getRawData())
                .build();
    }

    private Telemetry fromDTO(TelemetryDTO dto) {
        return Telemetry.builder()
                .vehicleId(dto.getVehicleId())
                .timestamp(dto.getTimestamp())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .speed(dto.getSpeed())
                .heading(dto.getHeading())
                .altitude(dto.getAltitude())
                .fuelLevel(dto.getFuelLevel())
                .engineTemp(dto.getEngineTemp())
                .oilPressure(dto.getOilPressure())
                .batteryVoltage(dto.getBatteryVoltage())
                .rpm(dto.getRpm())
                .odometer(dto.getOdometer())
                .ignitionStatus(dto.getIgnitionStatus())
                .engineStatus(dto.getEngineStatus())
                .rawData(dto.getRawData())
                .build();
    }
}
