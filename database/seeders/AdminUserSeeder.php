<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@baytmart.com'],
            [
                'name' => 'BaytMart Admin',
                'password' => 'password',
                'is_admin' => true,
            ],
        );
    }
}
