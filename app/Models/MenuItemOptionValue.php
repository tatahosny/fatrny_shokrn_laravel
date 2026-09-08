<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItemOptionValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_item_option_id',
        'name',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(MenuItemOption::class, 'menu_item_option_id');
    }
}
