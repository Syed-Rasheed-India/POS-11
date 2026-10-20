<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class Phase8GatewayController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['id' => 1, 'name' => 'Stripe', 'is_active' => true],
                ['id' => 2, 'name' => 'PayPal', 'is_active' => false]
            ]
        ]);
    }

    public function configureCompanyGateway(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Payment gateway configured successfully',
            'data' => $request->all()
        ]);
    }
}