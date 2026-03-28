package com.spyzier.fleet.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "geofences", indexes = {
        @Index(name = "idx_geofences_tenant_id", columnList = "tenant_id"),
        @Index(name = "idx_geofences_active", columnList = "active")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoFence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private GeoFenceType type;

    @Column(name = "center_latitude")
    private Double centerLatitude;

    @Column(name = "center_longitude")
    private Double centerLongitude;

    @Column
    private Double radius;

    @Column(name = "polygon_coordinates", columnDefinition = "TEXT")
    private String polygonCoordinates;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "alert_on_entry", nullable = false)
    @Builder.Default
    private boolean alertOnEntry = true;

    @Column(name = "alert_on_exit", nullable = false)
    @Builder.Default
    private boolean alertOnExit = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum GeoFenceType {
        CIRCLE, POLYGON
    }
}
