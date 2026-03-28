package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.AlertDTO;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.Alert;
import com.spyzier.fleet.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    @Transactional(readOnly = true)
    public Page<AlertDTO> getAllAlerts(Pageable pageable) {
        return alertRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public AlertDTO getById(Long id) {
        return alertRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));
    }

    @Transactional(readOnly = true)
    public List<AlertDTO> getByVehicleId(String vehicleId) {
        return alertRepository.findByVehicleId(vehicleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AlertDTO> getActiveAlerts(Pageable pageable) {
        return alertRepository.findByAcknowledgedFalse(pageable).map(this::toDTO);
    }

    @Transactional
    public AlertDTO createAlert(AlertDTO dto) {
        Alert alert = fromDTO(dto);
        alert = alertRepository.save(alert);
        log.info("Created alert type {} for vehicle {}", alert.getType(), alert.getVehicleId());
        return toDTO(alert);
    }

    @Transactional
    public AlertDTO acknowledgeAlert(Long id, String acknowledgedBy) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));

        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(acknowledgedBy);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert = alertRepository.save(alert);
        log.info("Alert {} acknowledged by {}", id, acknowledgedBy);
        return toDTO(alert);
    }

    public AlertDTO toDTO(Alert alert) {
        return AlertDTO.builder()
                .id(alert.getId())
                .vehicleId(alert.getVehicleId())
                .driverId(alert.getDriverId())
                .type(alert.getType())
                .severity(alert.getSeverity())
                .message(alert.getMessage())
                .timestamp(alert.getTimestamp())
                .acknowledged(alert.isAcknowledged())
                .acknowledgedBy(alert.getAcknowledgedBy())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .build();
    }

    private Alert fromDTO(AlertDTO dto) {
        return Alert.builder()
                .vehicleId(dto.getVehicleId())
                .driverId(dto.getDriverId())
                .type(dto.getType())
                .severity(dto.getSeverity())
                .message(dto.getMessage())
                .timestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now())
                .acknowledged(false)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();
    }
}
