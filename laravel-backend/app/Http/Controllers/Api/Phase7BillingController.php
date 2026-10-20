<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class Phase7BillingController extends Controller
{
    public function indexInvoices(Request $request)
    {
        // Custom test data to verify live frontend-backend connection
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'invoice_number' => 'TEST-9001',
                    'vendor' => 'Alpha Test Store',
                    'issued_date' => '01 Oct 2026',
                    'due_date' => '28 Oct 2026',
                    'total' => 999.00,
                    'balance' => 0.00,
                    'status' => 'PAID'
                ],
                [
                    'id' => 2,
                    'invoice_number' => 'TEST-9002',
                    'vendor' => 'Beta Electronics Hub',
                    'issued_date' => '05 Oct 2026',
                    'due_date' => '28 Oct 2026',
                    'total' => 1500.50,
                    'balance' => 500.00,
                    'status' => 'DUE'
                ],
                [
                    'id' => 3,
                    'invoice_number' => 'TEST-9003',
                    'vendor' => 'Gamma Restaurant Group',
                    'issued_date' => '10 Oct 2026',
                    'due_date' => '28 Oct 2026',
                    'total' => 450.00,
                    'balance' => 0.00,
                    'status' => 'PAID'
                ]
            ]
        ]);
    }

    public function storeInvoice(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully',
            'data' => $request->all()
        ], 201);
    }

    public function showInvoice($id)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $id,
                'invoice_number' => 'TEST-900' . $id,
                'total' => 999.00,
                'status' => 'PAID'
            ]
        ]);
    }

    public function recordPayment(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully'
        ], 201);
    }
}