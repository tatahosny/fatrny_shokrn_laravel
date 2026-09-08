<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Offer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
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
        return Inertia::render('Restaurant/Offers/Index', [
            'offers'     => Offer::where('restaurant_id', $restaurant->id)->latest()->paginate(15),
            'restaurant' => $restaurant,
        ]);
    }

    public function create(): Response
    {
        $restaurant = $this->restaurant();
        return Inertia::render('Restaurant/Offers/Create', [
            'categories' => Category::where('restaurant_id', $restaurant->id)->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'original_price'     => 'required|numeric|min:0',
            'discount_price'     => 'required|numeric|min:0',
            'is_active'          => 'boolean',
            'is_student_only'    => 'boolean',
            'start_date'         => 'nullable|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
        ]);

        $validated['restaurant_id']       = $restaurant->id;
        $validated['discount_percentage'] = $validated['original_price'] > 0
            ? round((($validated['original_price'] - $validated['discount_price']) / $validated['original_price']) * 100, 1)
            : 0;

        $offer = Offer::create($validated);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/offers", 'public');
            $offer->update(['image' => $path]);
        }

        // Clear public offers cache
        cache()->forget('public.active_offers');

        return redirect()->route('restaurant.offers.index')->with('success', 'تم إنشاء العرض.');
    }

    public function edit(int $id): Response
    {
        $restaurant = $this->restaurant();
        $offer = Offer::where('restaurant_id', $restaurant->id)->findOrFail($id);
        return Inertia::render('Restaurant/Offers/Edit', ['offer' => $offer]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $offer = Offer::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'original_price'  => 'required|numeric|min:0',
            'discount_price'  => 'required|numeric|min:0',
            'is_active'       => 'boolean',
            'is_student_only' => 'boolean',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
        ]);
        $validated['discount_percentage'] = $validated['original_price'] > 0
            ? round((($validated['original_price'] - $validated['discount_price']) / $validated['original_price']) * 100, 1)
            : 0;
        $offer->update($validated);
        cache()->forget('public.active_offers');
        return back()->with('success', 'تم تحديث العرض.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        Offer::where('restaurant_id', $restaurant->id)->findOrFail($id)->delete();
        cache()->forget('public.active_offers');
        return back()->with('success', 'تم حذف العرض.');
    }

    public function toggle(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $offer = Offer::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $offer->update(['is_active' => !$offer->is_active]);
        cache()->forget('public.active_offers');
        return back()->with('success', $offer->is_active ? 'تم تفعيل العرض.' : 'تم إيقاف العرض.');
    }
}
