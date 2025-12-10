<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the lost_found_items table in database.
     */
    public function up()
    {
        Schema::create('lost_found_items', function (Blueprint $table) {
            // Primary key
            $table->id();
            
            // Item type: 'lost' or 'found'
            $table->enum('type', ['lost', 'found']);
            
            // Item information
            $table->string('title');               // Item title
            $table->string('category');            // Item category
            $table->text('description');           // Detailed description
            $table->string('location');            // Location where lost/found
            $table->date('date');                  // Date of loss/finding
            
            // Optional image
            $table->string('image')->nullable();   // Image file path (optional)
            
            // Contact information
            $table->string('contact_email');       // Email for contact
            
            // Storage location (only for found items)
            $table->string('storage_location')->nullable();
            
            // Item status
            $table->enum('status', ['pending', 'resolved', 'claimed'])
                  ->default('pending');            // Default: pending
            
            // Foreign key to users table
            $table->foreignId('user_id')
                  ->nullable()                     // Can be null if user not logged in
                  ->constrained()                  // References users table
                  ->onDelete('set null');          // Set null when user is deleted
            
            // Timestamps (created_at, updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     * Drops the table if it exists.
     */
    public function down()
    {
        Schema::dropIfExists('lost_found_items');
    }
};