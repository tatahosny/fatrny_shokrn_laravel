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
            'is_active'          => 'nullable|boolean',
            'is_student_only'    => 'nullable|boolean',
            'start_date'         => 'nullable|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
            'image'              => 'nullable|image|max:10240',
        ]);

        $orig = (float) $validated['original_price'];
        $disc = (float) $validated['discount_price'];

        $offerData = [
            'restaurant_id'       => $restaurant->id,
            'title'               => $validated['title'],
            'description'         => $validated['description'] ?? null,
            'original_price'      => $orig,
            'discount_price'      => $disc,
            'discount_percentage' => $orig > 0 ? round((($orig - $disc) / $orig) * 100, 1) : 0,
            'is_active'           => $request->boolean('is_active', true),
            'is_student_only'     => $request->boolean('is_student_only', false),
            'start_date'          => $validated['start_date'] ?? now(),
            'end_date'            => $validated['end_date'] ?? now()->addMonths(1),
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/offers", 'public');
            $offerData['image'] = $path;
        }

        Offer::create($offerData);

        // Clear public offers cache
        cache()->forget('public.active_offers');

        return redirect()->route('restaurant.offers.index')->with('success', 'تم إنشاء العرض الترويجي بنجاح.');
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
            'is_active'       => 'nullable|boolean',
            'is_student_only' => 'nullable|boolean',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'image'           => 'nullable|image|max:10240',
        ]);

        $orig = (float) $validated['original_price'];
        $disc = (float) $validated['discount_price'];

        $updateData = [
            'title'               => $validated['title'],
            'description'         => $validated['description'] ?? null,
            'original_price'      => $orig,
            'discount_price'      => $disc,
            'discount_percentage' => $orig > 0 ? round((($orig - $disc) / $orig) * 100, 1) : 0,
            'is_active'           => $request->has('is_active') ? $request->boolean('is_active') : $offer->is_active,
            'is_student_only'     => $request->has('is_student_only') ? $request->boolean('is_student_only') : $offer->is_student_only,
        ];

        if (!empty($validated['start_date'])) {
            $updateData['start_date'] = $validated['start_date'];
        }
        if (!empty($validated['end_date'])) {
            $updateData['end_date'] = $validated['end_date'];
        }

        if ($request->hasFile('image')) {
            if ($offer->image && !str_starts_with($offer->image, 'http') && \Illuminate\Support\Facades\Storage::disk('public')->exists($offer->image)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($offer->image);
            }
            $path = $request->file('image')->store("restaurants/{$restaurant->id}/offers", 'public');
            $updateData['image'] = $path;
        }

        $offer->update($updateData);
        cache()->forget('public.active_offers');
        return back()->with('success', 'تم تحديث العرض بنجاح.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $offer = Offer::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $offer->delete();
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
