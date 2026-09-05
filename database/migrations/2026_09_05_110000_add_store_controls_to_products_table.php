<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable()->unique()->after('slug');
            $table->string('brand')->nullable()->after('category');
            $table->decimal('compare_at_price', 12, 2)->nullable()->after('price');
            $table->json('tags')->nullable()->after('description');
            $table->json('options')->nullable()->after('tags');
            $table->json('variants')->nullable()->after('options');
            $table->string('seo_title')->nullable()->after('is_active');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->boolean('track_inventory')->default(true)->after('is_featured');
            $table->boolean('allow_backorder')->default(false)->after('track_inventory');
            $table->decimal('weight', 8, 2)->nullable()->after('allow_backorder');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'sku', 'brand', 'compare_at_price', 'tags', 'options', 'variants',
                'seo_title', 'seo_description', 'is_featured', 'track_inventory',
                'allow_backorder', 'weight',
            ]);
        });
    }
};