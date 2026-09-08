<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Backup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BackupController extends Controller
{
    public function index(): Response
    {
        $backups = Backup::latest()->paginate(15);
        return Inertia::render('Admin/Backups/Index', ['backups' => $backups]);
    }

    public function create(): RedirectResponse
    {
        try {
            // Dispatch backup job to queue
            \App\Jobs\CreateDatabaseBackup::dispatch(auth()->id());
            return back()->with('success', 'تم إرسال طلب النسخة الاحتياطية. ستكتمل العملية في الخلفية.');
        } catch (\Exception $e) {
            return back()->with('error', 'فشل إنشاء النسخة الاحتياطية: ' . $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        $backup = Backup::findOrFail($id);
        if ($backup->file_path && Storage::exists($backup->file_path)) {
            Storage::delete($backup->file_path);
        }
        $backup->delete();
        ActivityLog::log('BACKUP_DELETED', 'Backup', $id);
        return back()->with('success', 'تم حذف النسخة الاحتياطية.');
    }
}
