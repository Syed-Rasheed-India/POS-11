import { api } from "./client";

export type CompanySubscription = {
  id: number;
  uuid: string;
  company_id: number;
  plan_id: number;
  billing_cycle: string;
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: boolean;
  price: string | number;
  currency_id: number;
  company?: { id: number; company_name: string; company_code: string };
  plan?: { id: number; plan_code: string; plan_name: string; monthly_price: string | number; yearly_price: string | number | null };
  currency?: { id: number; currency_code: string; currency_name: string; symbol: string | null };
  limit_snapshots?: SubscriptionLimitSnapshot[];
  usage?: SubscriptionUsage[];
  usage_logs?: SubscriptionUsageLog[];
  addons?: CompanySubscriptionAddon[];
  trials?: SubscriptionTrial[];
  grace_periods?: SubscriptionGracePeriod[];
  limit_overrides?: CompanyLimitOverride[];
};

export type SubscriptionLimitSnapshot = {
  id: number;
  subscription_id: number;
  limit_code: string;
  limit_value: string | number | null;
  unlimited: boolean;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
};

export type SubscriptionUsage = {
  id: number;
  company_id: number;
  subscription_id: number;
  usage_code: string;
  usage_value: string | number;
  last_calculated_at: string;
  company?: { id: number; company_name: string; company_code: string };
  subscription?: CompanySubscription;
};

export type SubscriptionUsageLog = {
  id: number;
  company_id: number;
  subscription_id: number;
  usage_code: string;
  previous_value: string | number;
  new_value: string | number;
  source: string | null;
  created_at: string;
};

export type SubscriptionAddon = {
  id: number;
  uuid: string;
  addon_code: string;
  addon_name: string;
  description: string | null;
  price: string | number;
  currency_id: number;
  billing_cycle: string;
  is_active: boolean;
  currency?: { id: number; currency_code: string; currency_name: string; symbol: string | null };
};

export type CompanySubscriptionAddon = {
  id: number;
  company_subscription_id: number;
  addon_id: number;
  quantity: string | number;
  unit_price: string | number;
  start_date: string;
  end_date: string | null;
  status: string;
  addon?: SubscriptionAddon;
  subscription?: CompanySubscription;
};

export type SubscriptionTrial = {
  id: number;
  company_id: number;
  subscription_id: number;
  start_date: string;
  end_date: string;
  status: string;
  converted_at: string | null;
};

export type SubscriptionGracePeriod = {
  id: number;
  company_id: number;
  subscription_id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  approved_by: number | null;
};

export type SubscriptionChange = {
  id: number;
  company_id: number;
  old_subscription_id: number | null;
  new_subscription_id: number | null;
  change_type: string;
  old_plan_id: number | null;
  new_plan_id: number | null;
  reason: string | null;
  changed_by: number | null;
  changed_at: string;
};

export type CompanyLimitOverride = {
  id: number;
  uuid: string;
  company_id: number;
  subscription_id: number;
  limit_code: string;
  base_limit: string | number;
  override_value: string | number;
  override_type: "SET" | "INCREASE" | "DECREASE" | string;
  reason: string | null;
  starts_at: string;
  expires_at: string | null;
  status: string;
  created_by: number;
};

export const getCompanySubscriptions = () => api.get<CompanySubscription[]>("/company-subscriptions");
export const getCompanySubscription = (id: number | string) => api.get<CompanySubscription>(`/company-subscriptions/${id}`);
export const createCompanySubscription = (data: Omit<CompanySubscription, "id" | "uuid"> & { uuid?: string }) => api.post<CompanySubscription>("/company-subscriptions", data);
export const updateCompanySubscription = (id: number | string, data: Partial<CompanySubscription>) => api.put<CompanySubscription>(`/company-subscriptions/${id}`, data);
export const deleteCompanySubscription = (id: number | string) => api.delete(`/company-subscriptions/${id}`);

const resource = <T>(path: string) => ({
  list: () => api.get<T[]>(`/${path}`),
  get: (id: number | string) => api.get<T>(`/${path}/${id}`),
  create: (data: unknown) => api.post<T>(`/${path}`, data),
  update: (id: number | string, data: unknown) => api.put<T>(`/${path}/${id}`, data),
  remove: (id: number | string) => api.delete(`/${path}/${id}`),
});

export const subscriptionLimitSnapshotsApi = resource<SubscriptionLimitSnapshot>("subscription-limit-snapshots");
export const subscriptionUsageApi = resource<SubscriptionUsage>("subscription-usage");
export const subscriptionUsageLogsApi = resource<SubscriptionUsageLog>("subscription-usage-logs");
export const subscriptionAddonsApi = resource<SubscriptionAddon>("subscription-addons");
export const companySubscriptionAddonsApi = resource<CompanySubscriptionAddon>("company-subscription-addons");
export const subscriptionTrialsApi = resource<SubscriptionTrial>("subscription-trials");
export const subscriptionGracePeriodsApi = resource<SubscriptionGracePeriod>("subscription-grace-periods");
export const subscriptionChangesApi = resource<SubscriptionChange>("subscription-changes");
export const companyLimitOverridesApi = resource<CompanyLimitOverride>("company-limit-overrides");
