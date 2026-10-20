import { api } from "./client";

export const BACKEND_API_RESOURCES = [
  "countries","currencies","platform-settings","platform-configs","platform-modules","platform-features","feature-flags",
  "platform-admins","platform-admin-roles","platform-permissions","platform-role-permissions","platform-admin-user-roles",
  "platform-admin-sessions","platform-admin-login-logs","companies","company-settings","company-contacts","company-addresses",
  "company-status-history","company-users","username-rules","company-branches","company-warehouses","company-devices","company-terminals","company-tax-settings",
  "subscription-plans","subscription-plan-limits","subscription-plan-modules","subscription-plan-features",
  "company-subscriptions","subscription-limit-snapshots","subscription-usage","subscription-usage-logs","subscription-addons","company-subscription-addons","subscription-trials","subscription-grace-periods","subscription-changes","company-limit-overrides",
] as const;
export type BackendApiResource = typeof BACKEND_API_RESOURCES[number];
export const listBackendResource = <T = unknown>(resource: BackendApiResource) => api.get<T[]>(`/${resource}`);
export const getBackendResource = <T = unknown>(resource: BackendApiResource, id:number|string) => api.get<T>(`/${resource}/${id}`);
export const createBackendResource = <T = unknown>(resource: BackendApiResource, data:unknown) => api.post<T>(`/${resource}`, data);
export const updateBackendResource = <T = unknown>(resource: BackendApiResource, id:number|string, data:unknown) => api.put<T>(`/${resource}/${id}`, data);
export const deleteBackendResource = (resource: BackendApiResource, id:number|string) => api.delete(`/${resource}/${id}`);
