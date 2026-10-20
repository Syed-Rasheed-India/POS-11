'use client';

import React, { useEffect, useState } from 'react';
import { 
  fetchInvoices, 
  fetchPaymentGateways, 
  fetchApiClients 
} from '@/lib/api/phases7to11';

// Main / Default Billing View
export default function BillingView() {
  return <InvoicesView />;
}

/**
 * 1. Invoices View (Phase 7 - Connected to Laravel Backend)
 */
export function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const data = await fetchInvoices();
        setInvoices(data);
      } catch (err) {
        setError('Failed to load invoices from backend.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Invoice list</h1>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
          Connecting to Laravel backend...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Issued
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No records returned from backend API.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inv.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.issued_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.due_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${Number(inv.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${Number(inv.balance).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * 2. Payments Management View
 */
export function PaymentsView() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Payments Management</h1>
      <div className="bg-white shadow rounded-lg p-6 text-gray-500">
        Payments history and logs will appear here.
      </div>
    </div>
  );
}

/**
 * 3. Subscription Plans View
 */
export function PlansView() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Subscription Plans</h1>
      <div className="bg-white shadow rounded-lg p-6 text-gray-500">
        Available pricing and plan tiers management.
      </div>
    </div>
  );
}

/**
 * 4. Company Subscriptions View
 */
export function SubscriptionsView() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Company Subscriptions</h1>
      <div className="bg-white shadow rounded-lg p-6 text-gray-500">
        Active merchant subscriptions tracking.
      </div>
    </div>
  );
}

/**
 * 5. Usage & Limits View
 */
export function UsageView() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Usage & Limits</h1>
      <div className="bg-white shadow rounded-lg p-6 text-gray-500">
        API and resource consumption monitoring.
      </div>
    </div>
  );
}

/**
 * 6. Subscription Addons View
 */
export function AddonsView() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Subscription Addons</h1>
      <div className="bg-white shadow rounded-lg p-6 text-gray-500">
        Optional extensions and add-ons management.
      </div>
    </div>
  );
}

/**
 * 7. API Clients View (Phase 10 - Connected to Laravel Backend)
 */
export function ApiView() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadApiClients() {
      try {
        setLoading(true);
        const data = await fetchApiClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to load API clients', error);
      } finally {
        setLoading(false);
      }
    }
    loadApiClients();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">API Clients & Integration</h1>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Loading API clients from backend...
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Token Prefix</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No API clients found from backend.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {client.token_prefix || 'pos_live_••••'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {client.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.created_at || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * 8. Payment Gateways Configuration View (Phase 8 - Connected to Laravel Backend)
 */
export function GatewaysView() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadGateways() {
      try {
        setLoading(true);
        const data = await fetchPaymentGateways();
        setGateways(data);
      } catch (error) {
        console.error('Failed to load gateways', error);
      } finally {
        setLoading(false);
      }
    }
    loadGateways();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Payment Gateways Configuration</h1>
      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow text-gray-500">Loading gateways from backend...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gateways.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-gray-400">No payment gateways configured from backend.</div>
          ) : (
            gateways.map((gw, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800">{gw.name || 'Gateway'}</h3>
                <p className="text-sm text-gray-500 mt-1">Status: {gw.status || 'Active'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 9. Invoice Detail View
 */
export function InvoiceDetailView() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Invoice Details</h1>
      <div className="bg-white shadow rounded-lg p-6 text-gray-500">
        Detailed breakdown of selected invoice transaction.
      </div>
    </div>
  );
}

/**
 * 9. ECR Providers View (Phase 9 - Connected to Laravel Backend)
 */
export function EcrView() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEcr() {
      try {
        setLoading(true);
        // Ensure fetchEcrProviders is imported from your API client
        const res = await fetch('http://127.0.0.1:8000/api/ecr/providers');
        const json = await res.json();
        setProviders(json.data || json);
      } catch (error) {
        console.error('Failed to load ECR providers', error);
      } finally {
        setLoading(false);
      }
    }
    loadEcr();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">ECR Hardware Providers</h1>
      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow text-gray-500">Loading ECR providers...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          {providers.length === 0 ? (
            <p className="text-gray-400">No ECR providers found from backend.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {providers.map((prov, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span className="font-medium text-gray-800">{prov.name || 'Terminal Provider'}</span>
                  <span className="text-sm text-gray-500">{prov.status || 'Active'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}