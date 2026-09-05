<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'slug', 'sku', 'brand', 'category', 'description', 'image_url', 'source_url', 'source_price', 'price', 'compare_at_price', 'stock', 'tags', 'options', 'variants', 'is_active', 'is_featured', 'track_inventory', 'allow_backorder', 'weight', 'seo_title', 'seo_description'])]
class Product extends Model
{
    protected function casts(): array
    {
        return [
            'source_price' => 'decimal:2',
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'tags' => 'array',
            'options' => 'array',
            'variants' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'track_inventory' => 'boolean',
            'allow_backorder' => 'boolean',
            'weight' => 'decimal:2',
        ];
    }
}
