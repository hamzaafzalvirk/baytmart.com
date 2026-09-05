<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required']]);
        abort_unless(Auth::attempt($credentials), 422, 'Invalid login details.');

        $user = $request->user();
        abort_unless($user->is_admin, 403, 'Admin access required.');

        return ['token' => $user->createToken('admin')->plainTextToken, 'user' => $user];
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->noContent();
    }
}
