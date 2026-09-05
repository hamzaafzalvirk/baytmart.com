<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\StoreMenu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([AdminUserSeeder::class, ProductSeeder::class]);

        foreach (['Computer Accessories', 'Home Decor', 'Bags & Travel', 'Everyday Carry', 'Textiles'] as $sort => $name) {
            Category::updateOrCreate(['name' => $name], ['slug' => str()->slug($name), 'sort_order' => $sort, 'is_active' => true]);
        }
        foreach (['Home', 'Shop', 'Computer Accessories', 'Home Decor', 'Bags & Travel'] as $sort => $label) {
            StoreMenu::updateOrCreate(['label' => $label], ['category' => $label === 'Home' || $label === 'Shop' ? null : $label, 'sort_order' => $sort, 'is_active' => true]);
        }
    }
}
