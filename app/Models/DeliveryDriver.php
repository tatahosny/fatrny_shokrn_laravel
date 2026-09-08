<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryDriver extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'name',
        'phone',
        'profile_image',
        'vehicle_type',
        'vehicle_plate',
        'is_active',
        'availability_status', // AVAILABLE, BUSY, OFFLINE
        'current_latitude',
        'current_longitude',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'current_latitude' => 'float',
            'current_longitude' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'assigned_delivery_id');
    }
}
