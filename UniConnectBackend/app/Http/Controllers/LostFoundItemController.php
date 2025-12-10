<?php

namespace App\Http\Controllers;

use App\Models\LostFoundItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class LostFoundItemController extends Controller
{
    /**
     * Get all lost items (pending status only)
     */
    public function indexLost()
    {
        // Get lost items with pending status, ordered by creation date
        $items = LostFoundItem::where('type', 'lost')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * Get all found items (pending status only)
     */
    public function indexFound()
    {
        // Get found items with pending status, ordered by creation date
        $items = LostFoundItem::where('type', 'found')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * Create a new lost item report
     */
    public function storeLost(Request $request)
    {
        // Validate incoming request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'contact_email' => 'required|email|max:255',
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Prepare data for database
        $data = $request->only([
            'title', 'category', 'description', 
            'location', 'date', 'contact_email'
        ]);
        
        // Set default values
        $data['type'] = 'lost';
        $data['status'] = 'pending';
        $data['user_id'] = Auth::id(); // Get current user ID

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('lost_found_images', $imageName, 'public');
            $data['image'] = $imagePath;
        }

        // Create the lost item in database
        $item = LostFoundItem::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Lost item reported successfully!',
            'data' => $item
        ], 201);
    }

    /**
     * Create a new found item report
     */
    public function storeFound(Request $request)
    {
        // Validate incoming request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'contact_email' => 'required|email|max:255',
            'storage_location' => 'required|string|max:255',
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Prepare data for database
        $data = $request->only([
            'title', 'category', 'description', 
            'location', 'date', 'contact_email',
            'storage_location'
        ]);
        
        // Set default values
        $data['type'] = 'found';
        $data['status'] = 'pending';
        $data['user_id'] = Auth::id(); // Get current user ID

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('lost_found_images', $imageName, 'public');
            $data['image'] = $imagePath;
        }

        // Create the found item in database
        $item = LostFoundItem::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Found item reported successfully!',
            'data' => $item
        ], 201);
    }

    /**
     * Get a single item by ID
     */
    public function show($id)
    {
        // Find item by ID
        $item = LostFoundItem::find($id);

        // Return 404 if item not found
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * Update an existing item
     */
    public function update(Request $request, $id)
    {
        // Find item by ID
        $item = LostFoundItem::find($id);

        // Return 404 if item not found
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        }

        // Check if user is authorized to update
        // Only owner or admin can update
        if (Auth::id() !== $item->user_id && !Auth::user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this item'
            ], 403);
        }

        // Validate incoming request data
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
            'location' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'contact_email' => 'sometimes|required|email|max:255',
            'storage_location' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:pending,resolved,claimed',
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle image update if new image provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($item->image && Storage::disk('public')->exists($item->image)) {
                Storage::disk('public')->delete($item->image);
            }
            
            // Store new image
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('lost_found_images', $imageName, 'public');
            $item->image = $imagePath;
        }

        // Update other fields
        $item->fill($request->except('image'));
        $item->save();

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully!',
            'data' => $item
        ]);
    }

    /**
     * Delete an item
     */
    public function destroy($id)
    {
        // Find item by ID
        $item = LostFoundItem::find($id);

        // Return 404 if item not found
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        }

        // Check if user is authorized to delete
        // Only owner or admin can delete
        if (Auth::id() !== $item->user_id && !Auth::user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this item'
            ], 403);
        }

        // Delete associated image if exists
        if ($item->image && Storage::disk('public')->exists($item->image)) {
            Storage::disk('public')->delete($item->image);
        }

        // Delete the item from database
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully!'
        ]);
    }

    /**
     * Search items by keyword
     */
    public function search(Request $request)
    {
        // Validate search parameters
        $validator = Validator::make($request->all(), [
            'keyword' => 'required|string|min:2',
            'type' => 'nullable|in:lost,found,all'
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $keyword = $request->keyword;
        $type = $request->type ?? 'all'; // Default to 'all' if not specified

        // Build search query
        $query = LostFoundItem::where('status', 'pending')
            ->where(function($q) use ($keyword) {
                $q->where('title', 'LIKE', "%{$keyword}%")
                  ->orWhere('description', 'LIKE', "%{$keyword}%")
                  ->orWhere('category', 'LIKE', "%{$keyword}%")
                  ->orWhere('location', 'LIKE', "%{$keyword}%");
            });

        // Filter by type if specified
        if ($type !== 'all') {
            $query->where('type', $type);
        }

        // Execute query and get results
        $items = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * Update item status (resolved or claimed)
     */
    public function updateStatus(Request $request, $id)
    {
        // Validate status parameter
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:resolved,claimed'
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Find item by ID
        $item = LostFoundItem::find($id);

        // Return 404 if item not found
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        }

        // Update status
        $item->status = $request->status;
        $item->save();

        return response()->json([
            'success' => true,
            'message' => 'Item status updated successfully!',
            'data' => $item
        ]);
    }
}