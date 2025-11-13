<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home()
    {
        $auth = Auth::user();
        $data = [
            'auth' => $auth,
        ];
        return Inertia::render('app/HomePage', $data);
    }
}