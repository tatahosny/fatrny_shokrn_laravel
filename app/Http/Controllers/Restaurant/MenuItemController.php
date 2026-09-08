<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MenuItemController extends Controller
{
    private function restaurant()
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);
        return $restaurant;
    }

    public function index(): Response
    {
        $restaurant = $this->restaurant();
        return Inertia::render('Restaurant/Menu/Index', [
            'menu_items' => MenuItem::where('restaurant_id', $restaurant->id)
                ->with('category:id,name')->orderBy('sort_order')->paginate(20),
            'categories' => Category::where('restaurant_id', $restaurant->id)->where('is_active', true)->get(['id', 'name']),
            'restaurant' => $restaurant,
        ]);
    }

    public function create(): Response
    {
        $restaurant = $this->restaurant();
        return Inertia::render('Restaurant/Menu/Create', [
            'categories' => Category::where('restaurant_id', $restaurant->id)->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $validated = $request->validate([
            'category_id'     => 'required|exists:categories,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|numeric|min:0',
            'discount_price'  => 'nullable|numeric|min:0',
            'is_available'    => 'nullable|boolean',
            'is_featured'     => 'nullable|boolean',
            'preparation_time'=> 'nullable|integer|min:1',
            'image'           => 'nullable|image|max:10240',
        ]);

        // Verify category belongs to this restaurant
        Category::where('restaurant_id', $restaurant->id)->findOrFail($validated['category_id']);

        $maxOrder = MenuItem::where('restaurant_id', $restaurant->id)->max('sort_order') ?? 0;
        
        $itemData = [
            'category_id'      => $validated['category_id'],
            'name'             => $validated['name'],
            'description'      => $validated['description'] ?? null,
            'price'            => $validated['price'],
            'discount_price'   => !empty($validated['discount_price']) ? $validated['discount_price'] : null,
            'is_available'     => $request->boolean('is_available', true),
            'is_featured'      => $request->boolean('is_featured', false),
            'preparation_time' => $validated['preparation_time'] ?? 10,
            'restaurant_id'    => $restaurant->id,
            'sort_order'       => $maxOrder + 1,
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/menu", 'public');
            $itemData['image'] = $path;
        }

        MenuItem::create($itemData);

        return redirect()->route('restaurant.menu.index')->with('success', 'تم إضافة الصنف بنجاح.');
    }

    public function edit(int $id): Response
    {
        $restaurant = $this->restaurant();
        $item = MenuItem::where('restaurant_id', $restaurant->id)->with(['options.values', 'addons'])->findOrFail($id);
        return Inertia::render('Restaurant/Menu/Edit', [
            'menuItem'   => $item,
            'item'       => $item,
            'categories' => Category::where('restaurant_id', $restaurant->id)->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $item = MenuItem::where('restaurant_id', $restaurant->id)->findOrFail($id);
        
        $validated = $request->validate([
            'category_id'     => 'required|exists:categories,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|numeric|min:0',
            'discount_price'  => 'nullable|numeric|min:0',
            'is_available'    => 'nullable|boolean',
            'is_featured'     => 'nullable|boolean',
            'preparation_time'=> 'nullable|integer|min:1',
            'image'           => 'nullable|image|max:10240',
        ]);

        $updateData = [
            'category_id'      => $validated['category_id'],
            'name'             => $validated['name'],
            'description'      => $validated['description'] ?? null,
            'price'            => $validated['price'],
            'discount_price'   => !empty($validated['discount_price']) ? $validated['discount_price'] : null,
            'is_available'     => $request->has('is_available') ? $request->boolean('is_available') : $item->is_available,
            'is_featured'      => $request->has('is_featured') ? $request->boolean('is_featured') : $item->is_featured,
            'preparation_time' => $validated['preparation_time'] ?? $item->preparation_time,
        ];

        if ($request->hasFile('image')) {
            if ($item->image && !str_starts_with($item->image, 'http') && \Illuminate\Support\Facades\Storage::disk('public')->exists($item->image)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($item->image);
            }
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/menu", 'public');
            $updateData['image'] = $path;
        }

        $item->update($updateData);
        return back()->with('success', 'تم تحديث بيانات وصورة الصنف بنجاح.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $item = MenuItem::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $item->delete();
        return back()->with('success', 'تم حذف الصنف بنجاح.');
    }

    public function toggleAvailability(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $item = MenuItem::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $item->update(['is_available' => !$item->is_available]);
        return back()->with('success', $item->is_available ? 'تم تفعيل الصنف.' : 'تم إخفاء الصنف.');
    }
}
