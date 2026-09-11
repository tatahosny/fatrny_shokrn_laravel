<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;
use RuntimeException;

/** Fetches a drivable route, never a straight-line approximation. */
class RoutingService
{
    public function drivingRoute(float $fromLat, float $fromLng, float $toLat, float $toLng): array
    {
        foreach ([$fromLat, $toLat] as $lat) {
            if ($lat < -90 || $lat > 90) throw new RuntimeException('Invalid latitude.');
        }
        foreach ([$fromLng, $toLng] as $lng) {
            if ($lng < -180 || $lng > 180) throw new RuntimeException('Invalid longitude.');
        }

        $baseUrl = rtrim(config('services.routing.url', 'https://router.project-osrm.org'), '/');
        try {
            // Routing is an enhancement, not a reason to block the whole UI for 8 seconds.
            $response = Http::acceptJson()->connectTimeout(1)->timeout(2)->get(
                "$baseUrl/route/v1/driving/$fromLng,$fromLat;$toLng,$toLat",
                ['overview' => 'false', 'steps' => 'false']
            );
        } catch (ConnectionException) {
            throw new RuntimeException('خدمة المسارات غير متاحة مؤقتًا.');
        }

        $route = $response->json('routes.0');
        if (!$response->successful() || !$route || !isset($route['distance'], $route['duration'])) {
            throw new RuntimeException('تعذر حساب مسار قيادة حقيقي الآن. حاول مرة أخرى.');
        }

        return [
            'distance_meters' => (int) round($route['distance']),
            'distance_km' => round($route['distance'] / 1000, 2),
            'duration_seconds' => (int) round($route['duration']),
            'duration_minutes' => max(1, (int) ceil($route['duration'] / 60)),
        ];
    }
}
