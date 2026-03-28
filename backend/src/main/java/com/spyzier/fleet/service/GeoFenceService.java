package com.spyzier.fleet.service;

import com.spyzier.fleet.dto.VehicleDTO;
import com.spyzier.fleet.exception.ResourceNotFoundException;
import com.spyzier.fleet.model.GeoFence;
import com.spyzier.fleet.repository.GeoFenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeoFenceService {

    private final GeoFenceRepository geoFenceRepository;

    @Transactional(readOnly = true)
    public Page<GeoFence> getAll(Pageable pageable) {
        return geoFenceRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public GeoFence getById(Long id) {
        return geoFenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GeoFence", "id", id));
    }

    @Transactional(readOnly = true)
    public List<GeoFence> getByTenant(String tenantId) {
        return geoFenceRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<GeoFence> getActive() {
        return geoFenceRepository.findByActiveTrue();
    }

    @Transactional
    public GeoFence create(GeoFence geoFence) {
        GeoFence saved = geoFenceRepository.save(geoFence);
        log.info("Created geofence '{}' for tenant {}", saved.getName(), saved.getTenantId());
        return saved;
    }

    @Transactional
    public GeoFence update(Long id, GeoFence updated) {
        GeoFence existing = geoFenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GeoFence", "id", id));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setType(updated.getType());
        existing.setCenterLatitude(updated.getCenterLatitude());
        existing.setCenterLongitude(updated.getCenterLongitude());
        existing.setRadius(updated.getRadius());
        existing.setPolygonCoordinates(updated.getPolygonCoordinates());
        existing.setActive(updated.isActive());
        existing.setAlertOnEntry(updated.isAlertOnEntry());
        existing.setAlertOnExit(updated.isAlertOnExit());

        return geoFenceRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!geoFenceRepository.existsById(id)) {
            throw new ResourceNotFoundException("GeoFence", "id", id);
        }
        geoFenceRepository.deleteById(id);
    }

    public boolean isVehicleInGeoFence(GeoFence fence, double lat, double lon) {
        if (fence.getType() == GeoFence.GeoFenceType.CIRCLE) {
            double distance = calculateDistance(
                    fence.getCenterLatitude(), fence.getCenterLongitude(), lat, lon);
            return distance <= fence.getRadius();
        }
        return false;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
