package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.dto.MaintenanceDTO;
import com.spyzier.fleet.service.MaintenanceService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
@Tag(name = "Maintenance", description = "Vehicle maintenance record endpoints")
@SecurityRequirement(name = "bearerAuth")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    @Operation(summary = "Get all maintenance records")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<Page<MaintenanceDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MaintenanceDTO> records = maintenanceService.getAllRecords(
                PageRequest.of(page, size, Sort.by("scheduledDate").descending()));
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get maintenance record by ID")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getById(id)));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get maintenance records for a vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getByVehicle(@PathVariable String vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getByVehicleId(vehicleId)));
    }

    @PostMapping
    @Operation(summary = "Create maintenance record")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> create(@Valid @RequestBody MaintenanceDTO dto) {
        MaintenanceDTO created = maintenanceService.create(dto);
        return ResponseEntity.status(201).body(ApiResponse.success(created, "Maintenance record created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update maintenance record")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> update(
            @PathVariable Long id, @Valid @RequestBody MaintenanceDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.update(id, dto), "Record updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete maintenance record")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        maintenanceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Record deleted"));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming maintenance (within 30 days by default)")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getUpcoming(
            @RequestParam(defaultValue = "30") int daysAhead) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getUpcoming(daysAhead)));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue maintenance records")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getOverdue() {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getOverdue()));
    }
}
