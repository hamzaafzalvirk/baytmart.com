<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderPlacedMail;
use App\Models\Category;
use App\Models\Order;
use App\Models\StoreMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StorefrontController extends Controller
{
    public function content()
    {
        return ['categories' => Category::where('is_active', true)->orderBy('sort_order')->get(), 'menu' => StoreMenu::where('is_active', true)->orderBy('sort_order')->get()];
    }

    public function order(Request $request)
    {
        $data = $request->validate([
            'firstName' => ['required', 'string', 'max:80'], 'lastName' => ['required', 'string', 'max:80'], 'email' => ['required', 'email'],
            'address' => ['required', 'string', 'max:500'], 'city' => ['required', 'string', 'max:100'], 'country' => ['required', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1'], 'items.*.id' => ['required', 'integer'], 'items.*.title' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'], 'items.*.price' => ['required', 'numeric', 'min:0'],
            'subtotal' => ['required', 'numeric', 'min:0'], 'shipping' => ['required', 'numeric', 'min:0'], 'total' => ['required', 'numeric', 'min:0'],
        ]);
        $order = Order::create(['order_number' => 'BM-'.now()->format('ymd').'-'.Str::upper(Str::random(6)), 'customer_name' => $data['firstName'].' '.$data['lastName'], 'email' => $data['email'], 'address' => $data['address'], 'city' => $data['city'], 'country' => $data['country'], 'items' => $data['items'], 'subtotal' => $data['subtotal'], 'shipping' => $data['shipping'], 'total' => $data['total']]);
        Mail::to($order->email)->send(new OrderPlacedMail($order));

        return response()->json(['order' => $order], 201);
    }
}
