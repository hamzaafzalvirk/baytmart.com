<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['label', 'category', 'url', 'is_active', 'sort_order'])]
class StoreMenu extends Model
{
    //
}
