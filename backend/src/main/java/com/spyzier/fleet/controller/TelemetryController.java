package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.ApiResponse;
import com.spyzier.fleet.dto.TelemetryDTO;
import com.spyzier.fleet.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
@Tag(name = "Telemetry", description = "Vehicle telemetry ingestion and retrieval endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TelemetryController {

    private final TelemetryService telemetryService;

    @PostMapping
    @Operation(summary = "Ingest telemetry data for a vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ResponseEntity<ApiResponse<TelemetryDTO>> ingest(@Valid @RequestBody TelemetryDTO dto) {
        TelemetryDTO saved = telemetryService.saveTelemetry(dto);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Telemetry ingested successfully"));
    }

    @GetMapping("/vehicle/{vehicleId}/latest")
    @Operation(summary = "Get latest telemetry for a vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<TelemetryDTO>> getLatest(@PathVariable String vehicleId) {
        TelemetryDTO latest = telemetryService.getLatestTelemetry(vehicleId);
        return ResponseEntity.ok(ApiResponse.success(latest));
    }

    @GetMapping("/vehicle/{vehicleId}/history")
    @Operation(summary = "Get telemetry history for a vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<Page<TelemetryDTO>>> getHistory(
            @PathVariable String vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<TelemetryDTO> history = telemetryService.getTelemetryHistory(
                vehicleId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/vehicle/{vehicleId}/range")
    @Operation(summary = "Get telemetry for a vehicle within a time range")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','VIEWER')")
    public ResponseEntity<ApiResponse<List<TelemetryDTO>>> getByRange(
            @PathVariable String vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        List<TelemetryDTO> data = telemetryService.getTelemetryBetween(vehicleId, from, to);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
