<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'menu_item_id',
        'title',
        'description',
        'original_price',
        'discount_price',
        'discount_percentage',
        'start_date',
        'end_date',
        'image',
        'is_active',
        'is_student_only',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
            'is_student_only' => 'boolean',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        $now = now();
        return $query->where('is_active', true)
                     ->where('start_date', '<=', $now)
                     ->where('end_date', '>=', $now);
    }
}
