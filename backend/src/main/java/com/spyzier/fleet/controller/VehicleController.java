package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.dto.TelemetryDTO;
import com.spyzier.fleet.dto.VehicleDTO;
import com.spyzier.fleet.model.Vehicle;
import com.spyzier.fleet.service.TelemetryService;
import com.spyzier.fleet.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Vehicle management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {

    private final VehicleService vehicleService;
    private final TelemetryService telemetryService;

    @GetMapping
    @Operation(summary = "Get all vehicles")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Page<VehicleDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<VehicleDTO> vehicles = vehicleService.getAllVehicles(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<VehicleDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleById(id)));
    }

    @GetMapping("/vehicle-id/{vehicleId}")
    @Operation(summary = "Get vehicle by vehicle identifier")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<VehicleDTO>> getByVehicleId(@PathVariable String vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleByVehicleId(vehicleId)));
    }

    @PostMapping
    @Operation(summary = "Create a new vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<VehicleDTO>> create(@Valid @RequestBody VehicleDTO dto) {
        VehicleDTO created = vehicleService.createVehicle(dto);
        return ResponseEntity.status(201).body(ApiResponse.success(created, "Vehicle created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<VehicleDTO>> update(
            @PathVariable Long id, @Valid @RequestBody VehicleDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.updateVehicle(id, dto), "Vehicle updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete vehicle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Vehicle deleted successfully"));
    }

    @GetMapping("/{id}/location")
    @Operation(summary = "Get current vehicle location")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLocation(@PathVariable Long id) {
        VehicleDTO vehicle = vehicleService.getVehicleById(id);
        Map<String, Object> location = Map.of(
                "vehicleId", vehicle.getVehicleId(),
                "latitude", vehicle.getLatitude() != null ? vehicle.getLatitude() : 0.0,
                "longitude", vehicle.getLongitude() != null ? vehicle.getLongitude() : 0.0,
                "lastUpdate", vehicle.getLastLocationUpdate() != null ? vehicle.getLastLocationUpdate() : ""
        );
        return ResponseEntity.ok(ApiResponse.success(location));
    }

    @PatchMapping("/{id}/location")
    @Operation(summary = "Update vehicle location")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<VehicleDTO>> updateLocation(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        VehicleDTO updated = vehicleService.updateVehicleLocation(id, latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update vehicle status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<VehicleDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam Vehicle.VehicleStatus status) {
        VehicleDTO updated = vehicleService.updateVehicleStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Status updated"));
    }

    @GetMapping("/{vehicleId}/telemetry/history")
    @Operation(summary = "Get vehicle telemetry history")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Page<TelemetryDTO>>> getTelemetryHistory(
            @PathVariable String vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<TelemetryDTO> history = telemetryService.getTelemetryHistory(
                vehicleId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
