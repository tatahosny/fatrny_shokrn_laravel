<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
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
        return Inertia::render('Restaurant/Categories/Index', [
            'categories' => Category::where('restaurant_id', $restaurant->id)
                ->withCount('menuItems')->orderBy('sort_order')->get(),
            'restaurant' => $restaurant,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        $maxOrder = Category::where('restaurant_id', $restaurant->id)->max('sort_order') ?? 0;
        Category::create([
            ...$validated,
            'restaurant_id' => $restaurant->id,
            'slug'          => Str::slug($validated['name']) . '-' . Str::random(4),
            'sort_order'    => $maxOrder + 1,
        ]);
        return back()->with('success', 'تم إضافة الفئة.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $category = Category::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        $category->update($validated);
        return back()->with('success', 'تم تحديث الفئة.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        Category::where('restaurant_id', $restaurant->id)->findOrFail($id)->delete();
        return back()->with('success', 'تم حذف الفئة.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $request->validate(['order' => 'required|array']);
        foreach ($request->order as $index => $id) {
            Category::where('restaurant_id', $restaurant->id)->where('id', $id)->update(['sort_order' => $index + 1]);
        }
        return back()->with('success', 'تم إعادة الترتيب.');
    }
}
