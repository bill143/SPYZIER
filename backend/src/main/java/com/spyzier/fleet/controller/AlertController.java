package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.AlertDTO;
import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Fleet alert management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get all alerts")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Page<AlertDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        Sort sort = Sort.by("timestamp").descending();
        Page<AlertDTO> alerts = activeOnly
                ? alertService.getActiveAlerts(PageRequest.of(page, size, sort))
                : alertService.getAllAlerts(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert by ID")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<AlertDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(alertService.getById(id)));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get alerts by vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<List<AlertDTO>>> getByVehicle(@PathVariable String vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(alertService.getByVehicleId(vehicleId)));
    }

    @PostMapping
    @Operation(summary = "Create alert")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<AlertDTO>> create(@RequestBody AlertDTO dto) {
        AlertDTO created = alertService.createAlert(dto);
        return ResponseEntity.status(201).body(ApiResponse.success(created, "Alert created"));
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an alert")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<AlertDTO>> acknowledge(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AlertDTO acknowledged = alertService.acknowledgeAlert(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(acknowledged, "Alert acknowledged"));
    }
}
