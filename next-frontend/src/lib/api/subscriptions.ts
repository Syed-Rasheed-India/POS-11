import { api } from "./client";

export type SubscriptionPlanLimit = {
  id: number;
  plan_id: number;
  limit_code: string;
  limit_value: string | number | null;
  unlimited: boolean;
  created_at: string;
  updated_at: string;
};

export type SubscriptionPlanModule = {
  id: number;
  plan_id: number;
  module_id: number;
  module?: { id: number; module_code: string; module_name: string };
  created_at: string;
  updated_at: string;
};

export type SubscriptionPlanFeature = {
  id: number;
  plan_id: number;
  feature_id: number;
  feature?: { id: number; feature_code: string; feature_name: string; module_id: number };
  created_at: string;
  updated_at: string;
};

export type SubscriptionPlan = {
  id: number;
  uuid: string;
  plan_code: string;
  plan_name: string;
  description: string | null;
  monthly_price: string | number;
  quarterly_price: string | number | null;
  half_yearly_price: string | number | null;
  yearly_price: string | number | null;
  currency_id: number;
  currency?: { id: number; currency_code: string; currency_name: string; symbol: string | null };
  trial_days: number;
  grace_days: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  limits: SubscriptionPlanLimit[];
  modules: { id: number; module_code: string; module_name: string }[];
  features: { id: number; feature_code: string; feature_name: string; module_id: number }[];
  plan_modules?: SubscriptionPlanModule[];
  plan_features?: SubscriptionPlanFeature[];
};

export type SubscriptionPlanPayload = {
  plan_code: string;
  plan_name: string;
  description?: string | null;
  monthly_price: number;
  quarterly_price?: number | null;
  half_yearly_price?: number | null;
  yearly_price?: number | null;
  currency_id: number;
  trial_days: number;
  grace_days: number;
  sort_order: number;
  is_active: boolean;
  limits?: { limit_code: string; limit_value: number | null; unlimited: boolean }[];
  module_ids?: number[];
  feature_ids?: number[];
};

export const getSubscriptionPlans = () => api.get<SubscriptionPlan[]>("/subscription-plans");
export const getSubscriptionPlan = (id: number | string) => api.get<SubscriptionPlan>(`/subscription-plans/${id}`);
export const createSubscriptionPlan = (data: SubscriptionPlanPayload) => api.post<SubscriptionPlan>("/subscription-plans", data);
export const updateSubscriptionPlan = (id: number | string, data: Partial<SubscriptionPlanPayload>) => api.put<SubscriptionPlan>(`/subscription-plans/${id}`, data);
export const deleteSubscriptionPlan = (id: number | string) => api.delete(`/subscription-plans/${id}`);

export const getSubscriptionPlanLimits = () => api.get<SubscriptionPlanLimit[]>("/subscription-plan-limits");
export const getSubscriptionPlanModules = () => api.get<SubscriptionPlanModule[]>("/subscription-plan-modules");
export const getSubscriptionPlanFeatures = () => api.get<SubscriptionPlanFeature[]>("/subscription-plan-features");
