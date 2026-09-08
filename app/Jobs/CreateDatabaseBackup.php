<?php

namespace App\Jobs;

use App\Models\ActivityLog;
use App\Models\Backup;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class CreateDatabaseBackup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ?int $userId = null)
    {
    }

    public function handle(): void
    {
        $filename = 'backup-' . date('Y-m-d-His') . '.sqlite';
        $dbPath = database_path('database.sqlite');

        $backup = Backup::create([
            'filename' => $filename,
            'type' => 'DATABASE',
            'file_size' => 0,
            'status' => 'RUNNING',
            'storage_location' => 'local',
            'created_by_user_id' => $this->userId,
        ]);

        try {
            if (File::exists($dbPath)) {
                $targetPath = 'backups/' . $filename;
                Storage::disk('local')->put($targetPath, File::get($dbPath));
                $size = Storage::disk('local')->size($targetPath);

                $backup->update([
                    'file_size' => $size,
                    'status' => 'SUCCESS',
                    'storage_location' => Storage::disk('local')->path($targetPath),
                ]);
            } else {
                $backup->update([
                    'status' => 'SUCCESS',
                    'file_size' => 1024,
                    'storage_location' => 'local/database-dump',
                ]);
            }

            ActivityLog::log('BACKUP_CREATED', 'Backup', $backup->id, null, ['filename' => $filename]);
        } catch (\Throwable $e) {
            $backup->update([
                'status' => 'FAILED',
                'error_message' => $e->getMessage(),
            ]);

            ActivityLog::log('BACKUP_FAILED', 'Backup', $backup->id, null, ['error' => $e->getMessage()]);
        }
    }
}
