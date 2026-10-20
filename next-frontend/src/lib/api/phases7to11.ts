// import { api } from "./client";

// export const apiPhases7to11 = {
//   // Phase 07 - Billing & Invoicing
//   invoices: {
//     list: () => api.get("/v1/invoices"),
//     get: (id: number | string) => api.get(`/v1/invoices/${id}`),
//     create: (data: any) => api.post("/v1/invoices", data),
//     pay: (paymentData: any) => api.post("/v1/payments", paymentData),
//   },

//   // Phase 08 - Payment Gateways
//   gateways: {
//     list: () => api.get("/v1/payment-gateways"),
//     configureCompany: (data: any) => api.post("/v1/company-payment-gateways", data),
//   },

//   // Phase 09 - ECR Terminals
//   ecr: {
//     getProviders: () => api.get("/v1/ecr/providers"),
//     getTerminals: () => api.get("/v1/ecr/terminals"),
//     mapTerminal: (data: any) => api.post("/v1/ecr/terminals", data),
//   },

//   // Phase 10 - API Clients
//   apiClients: {
//     list: () => api.get("/v1/api-clients"),
//     create: (data: any) => api.post("/v1/api-clients", data),
//   },

//   // Phase 11 - Notifications
//   notifications: {
//     list: () => api.get("/v1/notifications"),
//     markRead: (id: number | string) => api.post(`/v1/notifications/${id}/read`, {}),
//   },
// };


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Phase 7: Fetch Billing & Invoices
 */
export async function fetchInvoices() {
  try {
    const res = await fetch(`${API_URL}/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch invoices: ${res.statusText}`);
    }

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('API Error [fetchInvoices]:', error);
    return [];
  }
}

/**
 * Phase 8: Fetch Payment Gateways
 */
export async function fetchPaymentGateways() {
  try {
    const res = await fetch(`${API_URL}/payment-gateways`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch payment gateways: ${res.statusText}`);
    }

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('API Error [fetchPaymentGateways]:', error);
    return [];
  }
}

/**
 * Phase 9: Fetch ECR Providers
 */
export async function fetchEcrProviders() {
  try {
    const res = await fetch(`${API_URL}/ecr/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ECR providers: ${res.statusText}`);
    }

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('API Error [fetchEcrProviders]:', error);
    return [];
  }
}

/**
 * Phase 10: Fetch API Clients
 */
export async function fetchApiClients() {
  try {
    const res = await fetch(`${API_URL}/api-clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch API clients: ${res.statusText}`);
    }

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('API Error [fetchApiClients]:', error);
    return [];
  }
}

/**
 * Phase 11: Fetch Notifications
 */
export async function fetchNotifications() {
  try {
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch notifications: ${res.statusText}`);
    }

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('API Error [fetchNotifications]:', error);
    return [];
  }
}