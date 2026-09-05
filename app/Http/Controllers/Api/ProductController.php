<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        return Product::query()
            ->where('is_active', true)
            ->when($request->filled('search'), fn ($query) => $query->where('title', 'like', '%'.$request->string('search').'%'))
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->latest()
            ->paginate(24);
    }

    public function show(Product $product)
    {
        abort_unless($product->is_active, 404);

        return $product;
    }

    public function categories()
    {
        return Product::where('is_active', true)->distinct()->orderBy('category')->pluck('category');
    }
}
