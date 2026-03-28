package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.VehicleDTO;
import com.spyzier.fleet.exception.DuplicateResourceException;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.Vehicle;
import com.spyzier.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public Page<VehicleDTO> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "vehicles", key = "#id")
    public VehicleDTO getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "vehicles", key = "'vehicleId_' + #vehicleId")
    public VehicleDTO getVehicleByVehicleId(String vehicleId) {
        return vehicleRepository.findByVehicleId(vehicleId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "vehicleId", vehicleId));
    }

    @Transactional(readOnly = true)
    public List<VehicleDTO> getVehiclesByTenant(String tenantId) {
        return vehicleRepository.findByTenantId(tenantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDTO createVehicle(VehicleDTO dto) {
        if (vehicleRepository.existsByVehicleId(dto.getVehicleId())) {
            throw new DuplicateResourceException("Vehicle", "vehicleId", dto.getVehicleId());
        }
        if (dto.getLicensePlate() != null && vehicleRepository.existsByLicensePlate(dto.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle", "licensePlate", dto.getLicensePlate());
        }
        if (dto.getVin() != null && vehicleRepository.existsByVin(dto.getVin())) {
            throw new DuplicateResourceException("Vehicle", "vin", dto.getVin());
        }

        Vehicle vehicle = fromDTO(dto);
        vehicle = vehicleRepository.save(vehicle);
        log.info("Created vehicle with ID: {}", vehicle.getVehicleId());
        return toDTO(vehicle);
    }

    @Transactional
    @CacheEvict(value = "vehicles", allEntries = true)
    public VehicleDTO updateVehicle(Long id, VehicleDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));

        if (!vehicle.getVehicleId().equals(dto.getVehicleId()) &&
                vehicleRepository.existsByVehicleId(dto.getVehicleId())) {
            throw new DuplicateResourceException("Vehicle", "vehicleId", dto.getVehicleId());
        }

        vehicle.setVehicleId(dto.getVehicleId());
        vehicle.setName(dto.getName());
        vehicle.setType(dto.getType());
        vehicle.setMake(dto.getMake());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setVin(dto.getVin());
        if (dto.getStatus() != null) vehicle.setStatus(dto.getStatus());
        vehicle.setCurrentDriverId(dto.getCurrentDriverId());
        vehicle.setTenantId(dto.getTenantId());

        vehicle = vehicleRepository.save(vehicle);
        log.info("Updated vehicle with ID: {}", vehicle.getVehicleId());
        return toDTO(vehicle);
    }

    @Transactional
    @CacheEvict(value = "vehicles", allEntries = true)
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle", "id", id);
        }
        vehicleRepository.deleteById(id);
        log.info("Deleted vehicle with id: {}", id);
    }

    @Transactional
    @CacheEvict(value = "vehicles", key = "#id")
    public VehicleDTO updateVehicleLocation(Long id, Double latitude, Double longitude) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));

        vehicle.setLatitude(latitude);
        vehicle.setLongitude(longitude);
        vehicle.setLastLocationUpdate(LocalDateTime.now());
        vehicle = vehicleRepository.save(vehicle);
        return toDTO(vehicle);
    }

    @Transactional
    @CacheEvict(value = "vehicles", key = "#id")
    public VehicleDTO updateVehicleStatus(Long id, Vehicle.VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        vehicle.setStatus(status);
        vehicle = vehicleRepository.save(vehicle);
        log.info("Updated vehicle {} status to {}", vehicle.getVehicleId(), status);
        return toDTO(vehicle);
    }

    public VehicleDTO toDTO(Vehicle vehicle) {
        return VehicleDTO.builder()
                .id(vehicle.getId())
                .vehicleId(vehicle.getVehicleId())
                .name(vehicle.getName())
                .type(vehicle.getType())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .licensePlate(vehicle.getLicensePlate())
                .vin(vehicle.getVin())
                .status(vehicle.getStatus())
                .currentDriverId(vehicle.getCurrentDriverId())
                .tenantId(vehicle.getTenantId())
                .latitude(vehicle.getLatitude())
                .longitude(vehicle.getLongitude())
                .lastLocationUpdate(vehicle.getLastLocationUpdate())
                .fuelLevel(vehicle.getFuelLevel())
                .engineStatus(vehicle.getEngineStatus())
                .odometer(vehicle.getOdometer())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }

    private Vehicle fromDTO(VehicleDTO dto) {
        return Vehicle.builder()
                .vehicleId(dto.getVehicleId())
                .name(dto.getName())
                .type(dto.getType())
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .licensePlate(dto.getLicensePlate())
                .vin(dto.getVin())
                .status(dto.getStatus() != null ? dto.getStatus() : Vehicle.VehicleStatus.ACTIVE)
                .currentDriverId(dto.getCurrentDriverId())
                .tenantId(dto.getTenantId())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .fuelLevel(dto.getFuelLevel())
                .engineStatus(dto.getEngineStatus())
                .odometer(dto.getOdometer())
                .build();
    }
}
