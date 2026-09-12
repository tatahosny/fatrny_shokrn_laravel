<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule): void {
        // Generate monthly invoices — runs daily at 08:00, command internally checks the billing_cycle day
        $schedule->command('billing:generate-monthly')->dailyAt('08:00');

        // Purge restaurants with no active invoice — runs daily at 08:30 (after invoice generation)
        $schedule->command('billing:purge-unlinked')->dailyAt('08:30');
    })
    ->withMiddleware(function (Middleware $middleware): void {
        // Inertia middleware — shares auth/flash data with every React page
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        // Portal role enforcement — usage: ->middleware('portal:ADMIN')
        $middleware->alias([
            'portal' => \App\Http\Middleware\EnsurePortalRole::class,
            'billing.check' => \App\Http\Middleware\CheckBillingStatus::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
