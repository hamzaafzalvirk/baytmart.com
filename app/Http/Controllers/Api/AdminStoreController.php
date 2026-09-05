<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\StoreMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminStoreController extends Controller
{
    public function categories()
    {
        return Category::orderBy('sort_order')->get();
    }

    public function saveCategory(Request $request)
    {
        $data = $request->validate(['id' => ['nullable', 'integer'], 'name' => ['required', 'string', 'max:80'], 'icon' => ['nullable', 'string', 'max:10'], 'is_active' => ['boolean'], 'sort_order' => ['integer', 'min:0']]);
        $category = Category::updateOrCreate(['id' => $data['id'] ?? null], [...$data, 'slug' => Str::slug($data['name'])]);

        return $category;
    }

    public function deleteCategory(Category $category)
    {
        $category->delete();
        return response()->noContent();
    }

    public function menu()
    {
        return StoreMenu::orderBy('sort_order')->get();
    }

    public function saveMenu(Request $request)
    {
        $data = $request->validate(['id' => ['nullable', 'integer'], 'label' => ['required', 'string', 'max:80'], 'category' => ['nullable', 'string'], 'url' => ['nullable', 'string'], 'is_active' => ['boolean'], 'sort_order' => ['integer', 'min:0']]);

        return StoreMenu::updateOrCreate(['id' => $data['id'] ?? null], $data);
    }

    public function deleteMenu(StoreMenu $menu)
    {
        $menu->delete();
        return response()->noContent();
    }
}
