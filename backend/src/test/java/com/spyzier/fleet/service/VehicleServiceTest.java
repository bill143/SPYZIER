package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.VehicleDTO;
import com.spyzier.fleet.exception.DuplicateResourceException;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.Vehicle;
import com.spyzier.fleet.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle sampleVehicle;
    private VehicleDTO sampleVehicleDTO;

    @BeforeEach
    void setUp() {
        sampleVehicle = Vehicle.builder()
                .id(1L)
                .vehicleId("VH-001")
                .name("Test Truck")
                .type(Vehicle.VehicleType.TRUCK)
                .make("Volvo")
                .model("FH16")
                .year(2021)
                .licensePlate("TST-001")
                .vin("1HGCM82633A004352")
                .status(Vehicle.VehicleStatus.ACTIVE)
                .tenantId("tenant-001")
                .latitude(40.7128)
                .longitude(-74.0060)
                .fuelLevel(85.0)
                .odometer(45000.0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        sampleVehicleDTO = VehicleDTO.builder()
                .vehicleId("VH-001")
                .name("Test Truck")
                .type(Vehicle.VehicleType.TRUCK)
                .make("Volvo")
                .model("FH16")
                .year(2021)
                .licensePlate("TST-001")
                .vin("1HGCM82633A004352")
                .status(Vehicle.VehicleStatus.ACTIVE)
                .tenantId("tenant-001")
                .build();
    }

    @Test
    void testGetAllVehicles_returnsPagedResults() {
        PageRequest pageable = PageRequest.of(0, 20);
        when(vehicleRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(sampleVehicle)));

        Page<VehicleDTO> result = vehicleService.getAllVehicles(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getVehicleId()).isEqualTo("VH-001");
        verify(vehicleRepository, times(1)).findAll(pageable);
    }

    @Test
    void testGetVehicleById_whenFound_returnsDTO() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));

        VehicleDTO result = vehicleService.getVehicleById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getVehicleId()).isEqualTo("VH-001");
        assertThat(result.getName()).isEqualTo("Test Truck");
        assertThat(result.getType()).isEqualTo(Vehicle.VehicleType.TRUCK);
    }

    @Test
    void testGetVehicleById_whenNotFound_throwsException() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.getVehicleById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle");
    }

    @Test
    void testCreateVehicle_whenValid_savesAndReturnsDTO() {
        when(vehicleRepository.existsByVehicleId("VH-001")).thenReturn(false);
        when(vehicleRepository.existsByLicensePlate("TST-001")).thenReturn(false);
        when(vehicleRepository.existsByVin("1HGCM82633A004352")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(sampleVehicle);

        VehicleDTO result = vehicleService.createVehicle(sampleVehicleDTO);

        assertThat(result).isNotNull();
        assertThat(result.getVehicleId()).isEqualTo("VH-001");
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void testCreateVehicle_whenDuplicateVehicleId_throwsException() {
        when(vehicleRepository.existsByVehicleId("VH-001")).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.createVehicle(sampleVehicleDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("VH-001");
    }

    @Test
    void testUpdateVehicle_whenFound_updatesAndReturns() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(sampleVehicle);

        VehicleDTO updated = sampleVehicleDTO;
        updated.setName("Updated Truck");

        VehicleDTO result = vehicleService.updateVehicle(1L, updated);

        assertThat(result).isNotNull();
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void testDeleteVehicle_whenFound_deletes() {
        when(vehicleRepository.existsById(1L)).thenReturn(true);
        doNothing().when(vehicleRepository).deleteById(1L);

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteVehicle_whenNotFound_throwsException() {
        when(vehicleRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> vehicleService.deleteVehicle(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle");
    }

    @Test
    void testUpdateVehicleStatus_updatesStatus() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        sampleVehicle.setStatus(Vehicle.VehicleStatus.MAINTENANCE);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(sampleVehicle);

        VehicleDTO result = vehicleService.updateVehicleStatus(1L, Vehicle.VehicleStatus.MAINTENANCE);

        assertThat(result.getStatus()).isEqualTo(Vehicle.VehicleStatus.MAINTENANCE);
    }

    @Test
    void testGetVehiclesByTenant_returnsFilteredVehicles() {
        when(vehicleRepository.findByTenantId("tenant-001")).thenReturn(List.of(sampleVehicle));

        List<VehicleDTO> result = vehicleService.getVehiclesByTenant("tenant-001");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTenantId()).isEqualTo("tenant-001");
    }

    @Test
    void testUpdateVehicleLocation_updatesCoordinates() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        sampleVehicle.setLatitude(41.0);
        sampleVehicle.setLongitude(-73.0);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(sampleVehicle);

        VehicleDTO result = vehicleService.updateVehicleLocation(1L, 41.0, -73.0);

        assertThat(result.getLatitude()).isEqualTo(41.0);
        assertThat(result.getLongitude()).isEqualTo(-73.0);
    }
}
