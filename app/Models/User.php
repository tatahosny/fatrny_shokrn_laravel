<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role', // SUPER_ADMIN, ADMIN, PLATFORM_STAFF, RESTAURANT_OWNER, RESTAURANT_STAFF, DELIVERY_DRIVER, CUSTOMER
        'is_active',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'SUPER_ADMIN';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF']);
    }

    public function isRestaurantStaff(): bool
    {
        return in_array($this->role, ['RESTAURANT_OWNER', 'RESTAURANT_STAFF']);
    }

    public function isDeliveryDriver(): bool
    {
        return $this->role === 'DELIVERY_DRIVER';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'CUSTOMER';
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function deliveryDriver(): HasOne
    {
        return $this->hasOne(DeliveryDriver::class);
    }

    public function restaurantStaff(): HasMany
    {
        return $this->hasMany(RestaurantStaff::class);
    }

    public function getRestaurantAttribute(): ?Restaurant
    {
        if ($this->isRestaurantStaff()) {
            return $this->restaurantStaff()->first()?->restaurant;
        }
        if ($this->isDeliveryDriver()) {
            return $this->deliveryDriver?->restaurant;
        }
        return null;
    }
}
