<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'cover_image',
        'description',
        'phone',
        'whatsapp',
        'email',
        'address',
        'latitude',
        'longitude',
        'status', // ACTIVE, INACTIVE, SUSPENDED, PENDING
        'opening_time',
        'closing_time',
        'minimum_order_amount',
        'delivery_fee',
        'estimated_delivery_time',
        'student_discount_percentage',
        'commission_type',
        'commission_percentage',
        'monthly_subscription_fee',
        'billing_cycle',
        'payment_due_date',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'minimum_order_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'student_discount_percentage' => 'decimal:2',
            'commission_percentage' => 'decimal:2',
            'monthly_subscription_fee' => 'decimal:2',
            'payment_due_date' => 'date',
        ];
    }

    public function staff(): HasMany
    {
        return $this->hasMany(RestaurantStaff::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class)->orderBy('sort_order');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function deliveryDrivers(): HasMany
    {
        return $this->hasMany(DeliveryDriver::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function financialRecords(): HasMany
    {
        return $this->hasMany(FinancialRecord::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function isOpen(): bool
    {
        if ($this->status !== 'ACTIVE') {
            return false;
        }
        $now = now()->format('H:i:s');
        return $now >= $this->opening_time && $now <= $this->closing_time;
    }
}
