package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.dto.DriverDTO;
import com.spyzier.fleet.service.DriverService;
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

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Drivers", description = "Driver management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    @Operation(summary = "Get all drivers")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Page<DriverDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<DriverDTO> drivers = driverService.getAllDrivers(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(drivers));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get driver by ID")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<DriverDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getDriverById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new driver")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DriverDTO>> create(@Valid @RequestBody DriverDTO dto) {
        DriverDTO created = driverService.createDriver(dto);
        return ResponseEntity.status(201).body(ApiResponse.success(created, "Driver created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update driver")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DriverDTO>> update(
            @PathVariable Long id, @Valid @RequestBody DriverDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(driverService.updateDriver(id, dto), "Driver updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete driver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Driver deleted successfully"));
    }
}
