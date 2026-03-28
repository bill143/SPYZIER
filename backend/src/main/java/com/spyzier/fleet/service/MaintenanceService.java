package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.MaintenanceDTO;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.MaintenanceRecord;
import com.spyzier.fleet.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    @Transactional(readOnly = true)
    public Page<MaintenanceDTO> getAllRecords(Pageable pageable) {
        return maintenanceRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public MaintenanceDTO getById(Long id) {
        return maintenanceRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRecord", "id", id));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> getByVehicleId(String vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceDTO create(MaintenanceDTO dto) {
        MaintenanceRecord record = fromDTO(dto);
        record = maintenanceRepository.save(record);
        log.info("Created maintenance record {} for vehicle {}", record.getId(), record.getVehicleId());
        return toDTO(record);
    }

    @Transactional
    public MaintenanceDTO update(Long id, MaintenanceDTO dto) {
        MaintenanceRecord record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRecord", "id", id));

        record.setVehicleId(dto.getVehicleId());
        record.setType(dto.getType());
        record.setDescription(dto.getDescription());
        record.setScheduledDate(dto.getScheduledDate());
        record.setCompletedDate(dto.getCompletedDate());
        record.setCost(dto.getCost());
        record.setTechnician(dto.getTechnician());
        if (dto.getStatus() != null) record.setStatus(dto.getStatus());
        record.setMileageAtService(dto.getMileageAtService());
        record.setNotes(dto.getNotes());

        record = maintenanceRepository.save(record);
        return toDTO(record);
    }

    @Transactional
    public void delete(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("MaintenanceRecord", "id", id);
        }
        maintenanceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> getUpcoming(int daysAhead) {
        LocalDate futureDate = LocalDate.now().plusDays(daysAhead);
        return maintenanceRepository.findUpcoming(futureDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceDTO> getOverdue() {
        return maintenanceRepository.findOverdue(LocalDate.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MaintenanceDTO toDTO(MaintenanceRecord record) {
        return MaintenanceDTO.builder()
                .id(record.getId())
                .vehicleId(record.getVehicleId())
                .type(record.getType())
                .description(record.getDescription())
                .scheduledDate(record.getScheduledDate())
                .completedDate(record.getCompletedDate())
                .cost(record.getCost())
                .technician(record.getTechnician())
                .status(record.getStatus())
                .mileageAtService(record.getMileageAtService())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    private MaintenanceRecord fromDTO(MaintenanceDTO dto) {
        return MaintenanceRecord.builder()
                .vehicleId(dto.getVehicleId())
                .type(dto.getType())
                .description(dto.getDescription())
                .scheduledDate(dto.getScheduledDate())
                .completedDate(dto.getCompletedDate())
                .cost(dto.getCost())
                .technician(dto.getTechnician())
                .status(dto.getStatus() != null ? dto.getStatus() : MaintenanceRecord.MaintenanceStatus.SCHEDULED)
                .mileageAtService(dto.getMileageAtService())
                .notes(dto.getNotes())
                .build();
    }
}
