<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Restaurant;
use Illuminate\Console\Command;

class GenerateMonthlyInvoices extends Command
{
    protected $signature   = 'billing:generate-monthly';
    protected $description = 'توليد الفواتير الشهرية التلقائية لكل المطاعم في يوم اشتراكهم';

    public function handle(): int
    {
        $today = now()->day; // e.g. 5 for the 5th of the month
        $currentMonth = now()->format('Y-m');

        // billing_day stores the day-of-month (1-28) chosen at restaurant creation.
        // Default = 1 (first of the month).
        $restaurants = Restaurant::where('billing_day', $today)->get();

        $generated = 0;

        foreach ($restaurants as $restaurant) {
            // Skip if already has an invoice for this month
            $alreadyHas = Invoice::where('restaurant_id', $restaurant->id)
                ->where('issue_date', 'like', "{$currentMonth}%")
                ->whereNotIn('status', ['CANCELLED'])
                ->exists();

            if ($alreadyHas) {
                continue;
            }

            // Determine amount
            if ($restaurant->commission_type === 'SUBSCRIPTION') {
                $amount  = (float) $restaurant->monthly_subscription_fee;
                $amount  = $amount > 0 ? $amount : 500.00;
                $invType = 'SUBSCRIPTION';
                $desc    = 'مستحقات الاشتراك الشهري — ' . now()->translatedFormat('F Y');
            } else {
                // For commission restaurants, invoice is generated after the billing period
                // with the platform's calculated commission. Use a placeholder here.
                $amount  = (float) $restaurant->monthly_subscription_fee;
                $amount  = $amount > 0 ? $amount : 100.00;
                $invType = 'COMMISSION';
                $desc    = 'مستحقات عمولة المبيعات — ' . now()->translatedFormat('F Y');
            }

            $dueDate = now()->addDays(7)->toDateString();

            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad(
                    Invoice::withTrashed()->count() + 1 + $generated,
                    4, '0', STR_PAD_LEFT
                ),
                'restaurant_id'  => $restaurant->id,
                'issue_date'     => now()->toDateString(),
                'due_date'       => $dueDate,
                'subtotal'       => $amount,
                'tax_amount'     => 0,
                'total_amount'   => $amount,
                'paid_amount'    => 0,
                'status'         => 'ISSUED',
                'invoice_type'   => $invType,
                'notes'          => 'فاتورة شهرية تلقائية — ' . now()->translatedFormat('F Y'),
            ]);

            InvoiceItem::create([
                'invoice_id'  => $invoice->id,
                'description' => $desc,
                'amount'      => $amount,
            ]);

            $restaurant->update(['payment_due_date' => $dueDate]);

            ActivityLog::log('INVOICE_AUTO_GENERATED', 'Invoice', $invoice->id, null, [
                'restaurant_id'   => $restaurant->id,
                'restaurant_name' => $restaurant->name,
                'month'           => $currentMonth,
            ]);

            $generated++;
        }

        $this->info("✅ تم توليد {$generated} فاتورة شهرية تلقائية.");
        return self::SUCCESS;
    }
}
