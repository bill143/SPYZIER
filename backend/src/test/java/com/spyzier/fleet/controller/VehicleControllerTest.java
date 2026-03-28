package com.spyzier.fleet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spyzier.fleet.config.JwtTokenProvider;
import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.dto.VehicleDTO;
import com.spyzier.fleet.model.Vehicle;
import com.spyzier.fleet.service.TelemetryService;
import com.spyzier.fleet.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private TelemetryService telemetryService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private VehicleDTO sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleVehicle = VehicleDTO.builder()
                .id(1L)
                .vehicleId("VH-001")
                .name("Test Truck")
                .type(Vehicle.VehicleType.TRUCK)
                .make("Volvo")
                .model("FH16")
                .year(2021)
                .licensePlate("TST-001")
                .status(Vehicle.VehicleStatus.ACTIVE)
                .tenantId("tenant-001")
                .latitude(40.7128)
                .longitude(-74.0060)
                .fuelLevel(85.0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllVehicles_returnsPagedVehicles() throws Exception {
        when(vehicleService.getAllVehicles(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(sampleVehicle)));

        mockMvc.perform(get("/api/v1/vehicles")
                        .param("page", "0")
                        .param("size", "20")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].vehicleId").value("VH-001"))
                .andExpect(jsonPath("$.data.content[0].name").value("Test Truck"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetVehicleById_returnsVehicle() throws Exception {
        when(vehicleService.getVehicleById(1L)).thenReturn(sampleVehicle);

        mockMvc.perform(get("/api/v1/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.vehicleId").value("VH-001"))
                .andExpect(jsonPath("$.data.type").value("TRUCK"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateVehicle_createsAndReturnsVehicle() throws Exception {
        VehicleDTO newVehicle = VehicleDTO.builder()
                .vehicleId("VH-002")
                .name("New Van")
                .type(Vehicle.VehicleType.VAN)
                .build();

        when(vehicleService.createVehicle(any(VehicleDTO.class))).thenReturn(sampleVehicle);

        mockMvc.perform(post("/api/v1/vehicles")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newVehicle)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Vehicle created successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateVehicle_updatesAndReturnsVehicle() throws Exception {
        when(vehicleService.updateVehicle(eq(1L), any(VehicleDTO.class))).thenReturn(sampleVehicle);

        mockMvc.perform(put("/api/v1/vehicles/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleVehicle)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Vehicle updated"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteVehicle_deletesSuccessfully() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(1L);

        mockMvc.perform(delete("/api/v1/vehicles/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Vehicle deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "VIEWER")
    void testDeleteVehicle_viewerForbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetVehicleLocation_returnsLocation() throws Exception {
        when(vehicleService.getVehicleById(1L)).thenReturn(sampleVehicle);

        mockMvc.perform(get("/api/v1/vehicles/1/location")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.vehicleId").value("VH-001"))
                .andExpect(jsonPath("$.data.latitude").value(40.7128));
    }
}
