<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['order_number', 'customer_name', 'email', 'address', 'city', 'country', 'items', 'subtotal', 'shipping', 'total', 'status'])]
class Order extends Model
{
    protected function casts(): array
    {
        return ['items' => 'array', 'subtotal' => 'decimal:2', 'shipping' => 'decimal:2', 'total' => 'decimal:2'];
    }
}
