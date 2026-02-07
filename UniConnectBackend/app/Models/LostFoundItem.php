<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostFoundItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * These fields can be filled using create() or update() methods.
     */
    protected $fillable = [
        'type',          // 'lost' or 'found'
        'title',         // Item title
        'category',      // Item category
        'description',   // Detailed description
        'location',      // Location where lost/found
        'date',          // Date of loss/finding
        'image',         // Optional image path
        'contact_email', // Contact email for reporting
        'storage_location', // Storage location for found items
        'status',        // 'pending', 'resolved', or 'claimed'
        'user_id'        // User who reported the item
    ];

    /**
     * The attributes that should be cast to native types.
     * Automatically converts date string to Carbon instance.
     */
    protected $casts = [
        'date' => 'date', // Convert string to Carbon date object
    ];

    /**
     * Define relationship with User model.
     * Each item belongs to one user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get only lost items.
     * Usage: LostFoundItem::lost()->get()
     */
    public function scopeLost($query)
    {
        return $query->where('type', 'lost');
    }

    /**
     * Scope to get only found items.
     * Usage: LostFoundItem::found()->get()
     */
    public function scopeFound($query)
    {
        return $query->where('type', 'found');
    }

    /**
     * Scope to get only active (pending) items.
     * Usage: LostFoundItem::active()->get()
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to search items by keyword.
     * Searches in title, description, and category.
     * Usage: LostFoundItem::search('phone')->get()
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('category', 'LIKE', "%{$search}%");
    }
}