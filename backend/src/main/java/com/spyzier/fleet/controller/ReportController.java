package com.spyzier.fleet.controller;

import com.spyzier.fleet.dto.*;
import com.spyzier.fleet.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Fleet reporting endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/fleet")
    @Operation(summary = "Generate fleet overview report")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<FleetReportDTO>> getFleetReport(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().minusDays(30)}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();
        FleetReportDTO report = reportService.generateFleetReport(from, to);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/maintenance")
    @Operation(summary = "Generate maintenance report for a date range")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getMaintenanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<MaintenanceDTO> report = reportService.generateMaintenanceReport(from, to);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/driver-activity")
    @Operation(summary = "Generate driver activity report")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<DriverDTO>>> getDriverActivityReport() {
        List<DriverDTO> report = reportService.generateDriverActivityReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
