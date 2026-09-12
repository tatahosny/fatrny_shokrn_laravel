<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Restaurant;
use Illuminate\Console\Command;

/**
 * Purge restaurants that have NO active (non-cancelled) invoice.
 *
 * Business rule:
 *   A restaurant MUST have at least one invoice that is NOT CANCELLED
 *   to be considered "linked" to the billing system.
 *   If it has none → it was likely created by mistake or its only invoice
 *   was cancelled → permanently delete it.
 *
 * This command is safe to run daily from the scheduler.
 */
class PurgeRestaurantsWithoutInvoices extends Command
{
    protected $signature   = 'billing:purge-unlinked';
    protected $description = 'حذف المطاعم التي ليس لها أي فاتورة نشطة (غير ملغية) من النظام';

    public function handle(): int
    {
        // Find restaurants that have zero non-cancelled invoices
        $orphans = Restaurant::whereDoesntHave('invoices', function ($q) {
            $q->where('status', '!=', 'CANCELLED');
        })->get();

        $deleted = 0;

        foreach ($orphans as $restaurant) {
            $name = $restaurant->name;
            $id   = $restaurant->id;

            $staffEntries = \App\Models\RestaurantStaff::where('restaurant_id', $restaurant->id)->with('user')->get();
            $usersToClean = [];
            foreach ($staffEntries as $staff) {
                if ($staff->user && in_array($staff->user->role, ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'])) {
                    $usersToClean[] = $staff->user;
                }
            }

            // forceDelete triggers cascade: categories, menu_items, staff, orders…
            $restaurant->forceDelete();

            foreach ($usersToClean as $user) {
                if (!\App\Models\RestaurantStaff::where('user_id', $user->id)->exists()) {
                    $user->forceDelete();
                }
            }

            ActivityLog::log('RESTAURANT_PURGED_NO_INVOICE', 'Restaurant', $id, null, [
                'name'   => $name,
                'reason' => 'لا توجد فاتورة نشطة مرتبطة بالحساب',
            ]);

            $this->warn("🗑️  [{$id}] {$name} — تم الحذف النهائي");
            $deleted++;
        }

        $this->info("✅ تم حذف {$deleted} مطعم غير مرتبط بأي فاتورة.");
        return self::SUCCESS;
    }
}
