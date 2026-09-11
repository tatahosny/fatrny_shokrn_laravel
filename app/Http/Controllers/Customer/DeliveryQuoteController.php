<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Services\RoutingService;
use Illuminate\Http\Request;

class DeliveryQuoteController extends Controller
{
    public function __invoke(Request $request, RoutingService $routing)
    {
        $data = $request->validate([
            'restaurant_id' => ['required', 'integer', 'exists:restaurants,id'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);
        $restaurant = Restaurant::findOrFail($data['restaurant_id']);
        abort_unless($restaurant->latitude !== null && $restaurant->longitude !== null, 422, 'لا يوجد موقع دقيق للمطعم بعد.');

        $route = $routing->drivingRoute((float) $restaurant->latitude, (float) $restaurant->longitude, (float) $data['latitude'], (float) $data['longitude']);
        $baseFee = (float) ($restaurant->delivery_base_fee ?? $restaurant->delivery_fee ?? 0);
        $perKm = (float) ($restaurant->delivery_fee_per_km ?? 0);

        return response()->json($route + [
            'base_fee' => $baseFee,
            'fee_per_km' => $perKm,
            'delivery_fee' => round($baseFee + ($route['distance_km'] * $perKm), 2),
        ]);
    }
}
