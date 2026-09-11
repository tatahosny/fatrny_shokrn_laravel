<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'customer_id',
        'restaurant_id',
        'assigned_delivery_id',
        'status', // PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, ASSIGNED_TO_DRIVER, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REJECTED, REFUNDED
        'payment_status', // PENDING, PAID, FAILED, REFUNDED
        'payment_method', // CASH_ON_DELIVERY, ONLINE_CARD, WALLET
        'subtotal',
        'discount_amount',
        'student_discount_amount',
        'delivery_fee',
        'service_fee',
        'total_amount',
        'platform_commission_amount',
        'address',
        'latitude',
        'longitude',
        'customer_notes',
        'restaurant_notes',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'student_discount_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'platform_commission_amount' => 'decimal:2',
            'latitude' => 'float',
            'longitude' => 'float',
            'delivered_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function deliveryDriver(): BelongsTo
    {
        return $this->belongsTo(DeliveryDriver::class, 'assigned_delivery_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    public function financialRecords(): HasMany
    {
        return $this->hasMany(FinancialRecord::class);
    }

    public function getGoogleMapsUrlAttribute(): ?string
    {
        if ($this->latitude && $this->longitude) {
            return "https://www.openstreetmap.org/?mlat={$this->latitude}&mlon={$this->longitude}#map=17/{$this->latitude}/{$this->longitude}";
        }
        return "https://www.openstreetmap.org/search?query=" . urlencode($this->address);
    }
}
