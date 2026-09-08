<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'university_name',
        'university_id_number',
        'university_id_card_image',
        'student_status', // NONE, PENDING, APPROVED, REJECTED
        'student_verified_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'student_verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isVerifiedStudent(): bool
    {
        return $this->student_status === 'APPROVED';
    }
}
