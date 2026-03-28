package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.model.GeoFence;
import com.spyzier.fleet.service.GeoFenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/geofences")
@RequiredArgsConstructor
@Tag(name = "GeoFences", description = "Geographic fence management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class GeoFenceController {

    private final GeoFenceService geoFenceService;

    @GetMapping
    @Operation(summary = "Get all geofences")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Page<GeoFence>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(geoFenceService.getAll(PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get geofence by ID")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<GeoFence>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(geoFenceService.getById(id)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active geofences")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<List<GeoFence>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(geoFenceService.getActive()));
    }

    @PostMapping
    @Operation(summary = "Create geofence")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<GeoFence>> create(@RequestBody GeoFence geoFence) {
        GeoFence created = geoFenceService.create(geoFence);
        return ResponseEntity.status(201).body(ApiResponse.success(created, "GeoFence created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update geofence")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<GeoFence>> update(
            @PathVariable Long id, @RequestBody GeoFence geoFence) {
        return ResponseEntity.ok(ApiResponse.success(geoFenceService.update(id, geoFence), "GeoFence updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete geofence")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        geoFenceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "GeoFence deleted"));
    }
}
