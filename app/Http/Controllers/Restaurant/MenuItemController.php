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
            'is_available'    => 'boolean',
            'is_featured'     => 'boolean',
            'preparation_time'=> 'nullable|integer|min:1',
        ]);

        // Verify category belongs to this restaurant
        Category::where('restaurant_id', $restaurant->id)->findOrFail($validated['category_id']);

        $maxOrder = MenuItem::where('restaurant_id', $restaurant->id)->max('sort_order') ?? 0;
        $item = MenuItem::create([
            ...$validated,
            'restaurant_id' => $restaurant->id,
            'sort_order'    => $maxOrder + 1,
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/menu", 'public');
            $item->update(['image' => $path]);
        }

        return redirect()->route('restaurant.menu.index')->with('success', 'تم إضافة العنصر.');
    }

    public function edit(int $id): Response
    {
        $restaurant = $this->restaurant();
        $item = MenuItem::where('restaurant_id', $restaurant->id)->with(['options.values', 'addons'])->findOrFail($id);
        return Inertia::render('Restaurant/Menu/Edit', [
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
            'is_available'    => 'boolean',
            'is_featured'     => 'boolean',
            'preparation_time'=> 'nullable|integer|min:1',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/menu", 'public');
            $validated['image'] = $path;
        }

        $item->update($validated);
        return back()->with('success', 'تم تحديث العنصر.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        MenuItem::where('restaurant_id', $restaurant->id)->findOrFail($id)->delete();
        return back()->with('success', 'تم حذف العنصر.');
    }

    public function toggleAvailability(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $item = MenuItem::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $item->update(['is_available' => !$item->is_available]);
        return back()->with('success', $item->is_available ? 'تم تفعيل العنصر.' : 'تم إخفاء العنصر.');
    }
}
