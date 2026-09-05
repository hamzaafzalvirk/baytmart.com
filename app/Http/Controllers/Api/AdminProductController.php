<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Product::latest()->paginate(30);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate($this->productRules());
        $data['slug'] = Str::slug($data['title']).'-'.Str::random(5);
        $data['sku'] ??= 'BM-'.str()->upper(Str::random(8));

        return response()->json(Product::create($data), 201);
    }

    public function import(Request $request, ProductImporter $importer)
    {
        $data = $request->validate([
            'url' => ['required', 'url:http,https'],
            'category' => ['required', 'string', 'max:80'],
            'stock' => ['nullable', 'integer', 'min:0'],
        ]);

        $product = $importer->fetch($data['url']);
        $product['category'] = $data['category'];
        $product['stock'] = $data['stock'] ?? 0;
        $product['is_active'] = true;
        $product['slug'] = Str::slug($product['title']).'-'.Str::random(5);
        $product['sku'] = 'BM-'.str()->upper(Str::random(8));
        $product['track_inventory'] = true;
        $product['is_featured'] = false;

        return response()->json(Product::create($product), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate($this->productRules(true, $product));
        $product->update($data);

        return $product->fresh();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->noContent();
    }

    private function productRules(bool $partial = false, ?Product $product = null): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:180'],
            'sku' => [$partial ? 'sometimes' : 'nullable', 'nullable', 'string', 'max:80', 'unique:products,sku,'.($product?->id ?? 'NULL')],
            'brand' => ['nullable', 'string', 'max:100'],
            'category' => [$required, 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
            'source_url' => [$partial ? 'sometimes' : 'required', 'url'],
            'source_price' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0.01'],
            'price' => [$required, 'numeric', 'min:0.01'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => [$required, 'integer', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
            'options' => ['nullable', 'array'],
            'variants' => ['nullable', 'array'],
            'variants.*.title' => ['required_with:variants', 'string', 'max:120'],
            'variants.*.sku' => ['nullable', 'string', 'max:80'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.stock' => ['required_with:variants', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'track_inventory' => ['boolean'],
            'allow_backorder' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:160'],
        ];
    }
}
