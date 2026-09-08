<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        // Cart is managed client-side (Zustand store)
        // This page just renders the React cart component
        return Inertia::render('Customer/Cart');
    }
}
