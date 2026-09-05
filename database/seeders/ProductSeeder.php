<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Product;
class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['title' => 'Arc Mechanical Keyboard', 'category' => 'Computer Accessories', 'source_price' => 72, 'image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=85'],
            ['title' => 'Orbit Wireless Headphones', 'category' => 'Computer Accessories', 'source_price' => 96, 'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85'],
            ['title' => 'Field Notes Desk Lamp', 'category' => 'Home Decor', 'source_price' => 54, 'image_url' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85'],
            ['title' => 'Linen Form Cushion', 'category' => 'Home Decor', 'source_price' => 28, 'image_url' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&q=85'],
            ['title' => 'Monument Ceramic Vase', 'category' => 'Home Decor', 'source_price' => 42, 'image_url' => 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=900&q=85'],
            ['title' => 'Cloud Everyday Backpack', 'category' => 'Bags & Travel', 'source_price' => 64, 'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85'],
            ['title' => 'Studio Steel Bottle', 'category' => 'Everyday Carry', 'source_price' => 19, 'image_url' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=85'],
            ['title' => 'Lounge Cotton Throw', 'category' => 'Textiles', 'source_price' => 38, 'image_url' => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=85'],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['source_url' => 'https://baytmart.com/demo/'.str()->slug($product['title'])],
                [
                    ...$product,
                    'slug' => str()->slug($product['title']),
                    'description' => 'A considered BaytMart essential made for daily use, with a simple form and lasting utility.',
                    'price' => round($product['source_price'] * 1.4, 2),
                    'stock' => 25,
                    'is_active' => true,
                ],
            );
        }
    }
}
