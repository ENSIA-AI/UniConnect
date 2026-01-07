<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new student (CREATE in CRUD)
     */
    public function register(Request $request)
    {
        // 1. VALIDATE the incoming data
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|unique:users|max:30',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // 2. CREATE the user in database
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Encrypt password
        ]);

        // 3. RETURN success response
        return response()->json([
            'message' => 'Student registered successfully!',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'email' => $user->email,
            ]
        ], 201); // 201 = Created
    }

    /**
     * Login existing student (READ/Authenticate in CRUD)
     */
    public function login(Request $request)
    {
        // 1. VALIDATE login data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. FIND user by email
        $user = User::where('email', $request->email)->first();

        // 3. CHECK password
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // 4. GENERATE API token (for future requests)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. RETURN success with token
        return response()->json([
            'message' => 'Login successful!',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'email' => $user->email,
            ],
            'token' => $token
        ]);
    }

    /**
     * Logout student (DELETE token in CRUD)
     */
    public function logout(Request $request)
    {
        // Delete the current API token
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}