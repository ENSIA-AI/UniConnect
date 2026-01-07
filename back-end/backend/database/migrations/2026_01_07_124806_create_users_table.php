<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            // WE HAVE THESE 5 FIELDS :
            $table->string('first_name');           // First Name
            $table->string('last_name');            // Last Name  
            $table->string('username')->unique();   // Username (must be unique)
            $table->string('email')->unique();      // Email (must be unique)
            $table->string('password');             // Password (will be encrypted)
            
            // Laravel default fields:
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
