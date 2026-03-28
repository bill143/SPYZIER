package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.DriverDTO;
import com.spyzier.fleet.exception.DuplicateResourceException;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.Driver;
import com.spyzier.fleet.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;

    @Transactional(readOnly = true)
    public Page<DriverDTO> getAllDrivers(Pageable pageable) {
        return driverRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "drivers", key = "#id")
    public DriverDTO getDriverById(Long id) {
        return driverRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));
    }

    @Transactional(readOnly = true)
    public List<DriverDTO> getDriversByTenant(String tenantId) {
        return driverRepository.findByTenantId(tenantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DriverDTO createDriver(DriverDTO dto) {
        if (driverRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new DuplicateResourceException("Driver", "employeeId", dto.getEmployeeId());
        }
        if (dto.getEmail() != null && driverRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Driver", "email", dto.getEmail());
        }
        if (driverRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver", "licenseNumber", dto.getLicenseNumber());
        }

        Driver driver = fromDTO(dto);
        driver = driverRepository.save(driver);
        log.info("Created driver with employee ID: {}", driver.getEmployeeId());
        return toDTO(driver);
    }

    @Transactional
    @CacheEvict(value = "drivers", key = "#id")
    public DriverDTO updateDriver(Long id, DriverDTO dto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));

        driver.setFirstName(dto.getFirstName());
        driver.setLastName(dto.getLastName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setLicenseExpiry(dto.getLicenseExpiry());
        driver.setPhone(dto.getPhone());
        driver.setEmail(dto.getEmail());
        if (dto.getStatus() != null) driver.setStatus(dto.getStatus());
        driver.setVehicleId(dto.getVehicleId());
        driver.setTenantId(dto.getTenantId());

        driver = driverRepository.save(driver);
        return toDTO(driver);
    }

    @Transactional
    @CacheEvict(value = "drivers", key = "#id")
    public void deleteDriver(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Driver", "id", id);
        }
        driverRepository.deleteById(id);
        log.info("Deleted driver with id: {}", id);
    }

    public DriverDTO toDTO(Driver driver) {
        return DriverDTO.builder()
                .id(driver.getId())
                .employeeId(driver.getEmployeeId())
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .licenseNumber(driver.getLicenseNumber())
                .licenseExpiry(driver.getLicenseExpiry())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .status(driver.getStatus())
                .vehicleId(driver.getVehicleId())
                .tenantId(driver.getTenantId())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }

    private Driver fromDTO(DriverDTO dto) {
        return Driver.builder()
                .employeeId(dto.getEmployeeId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .licenseNumber(dto.getLicenseNumber())
                .licenseExpiry(dto.getLicenseExpiry())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .status(dto.getStatus() != null ? dto.getStatus() : Driver.DriverStatus.AVAILABLE)
                .vehicleId(dto.getVehicleId())
                .tenantId(dto.getTenantId())
                .build();
    }
}
