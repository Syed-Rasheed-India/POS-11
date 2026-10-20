import { api } from "./client";


/* =========================================================
   GENERIC TYPES
========================================================= */

export type ApiId =
  number | string;


/* =========================================================
   COMPANY SETTINGS
========================================================= */

export type CompanySetting = {
  id: number;
  company_id: number;
  setting_key: string;
  setting_value: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};


export function getCompanySettings() {
  return api.get<CompanySetting[]>(
    "/company-settings",
  );
}


export function createCompanySetting(
  data: {
    company_id: number;
    setting_key: string;
    setting_value?: Record<string, unknown> | null;
  },
) {
  return api.post<CompanySetting>(
    "/company-settings",
    data,
  );
}


export function updateCompanySetting(
  id: ApiId,
  data: Partial<{
    company_id: number;
    setting_key: string;
    setting_value: Record<string, unknown> | null;
  }>,
) {
  return api.put<CompanySetting>(
    `/company-settings/${id}`,
    data,
  );
}


export function deleteCompanySetting(
  id: ApiId,
) {
  return api.delete(
    `/company-settings/${id}`,
  );
}


/* =========================================================
   COMPANY CONTACTS
========================================================= */

export type CompanyContact = {
  id: number;
  uuid: string;

  company_id: number;

  contact_type: string;
  contact_name: string;

  email: string | null;
  phone: string | null;
  designation: string | null;

  is_primary: boolean;

  created_at: string;
  updated_at: string;
};


export function getCompanyContacts() {
  return api.get<CompanyContact[]>(
    "/company-contacts",
  );
}


export function createCompanyContact(
  data: Omit<
    CompanyContact,
    | "id"
    | "uuid"
    | "created_at"
    | "updated_at"
  >,
) {
  return api.post<CompanyContact>(
    "/company-contacts",
    data,
  );
}


export function updateCompanyContact(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyContact,
      | "id"
      | "uuid"
      | "created_at"
      | "updated_at"
    >
  >,
) {
  return api.put<CompanyContact>(
    `/company-contacts/${id}`,
    data,
  );
}


export function deleteCompanyContact(
  id: ApiId,
) {
  return api.delete(
    `/company-contacts/${id}`,
  );
}


/* =========================================================
   COMPANY ADDRESSES
========================================================= */

export type CompanyAddress = {
  id: number;

  company_id: number;

  address_type: string;

  address_line_1: string;
  address_line_2: string | null;

  city: string | null;
  state: string | null;
  postal_code: string | null;

  country_id: number;

  latitude: number | null;
  longitude: number | null;

  is_primary: boolean;

  created_at: string;
  updated_at: string;
};


export function getCompanyAddresses() {
  return api.get<CompanyAddress[]>(
    "/company-addresses",
  );
}


export function createCompanyAddress(
  data: Omit<
    CompanyAddress,
    "id" | "created_at" | "updated_at"
  >,
) {
  return api.post<CompanyAddress>(
    "/company-addresses",
    data,
  );
}


export function updateCompanyAddress(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyAddress,
      "id" | "created_at" | "updated_at"
    >
  >,
) {
  return api.put<CompanyAddress>(
    `/company-addresses/${id}`,
    data,
  );
}


export function deleteCompanyAddress(
  id: ApiId,
) {
  return api.delete(
    `/company-addresses/${id}`,
  );
}


/* =========================================================
   COMPANY STATUS HISTORY
========================================================= */

export type CompanyStatusHistory = {
  id: number;

  company_id: number;

  old_status: string | null;
  new_status: string;

  reason: string | null;

  changed_by: number | null;

  changed_at: string;
};


export function getCompanyStatusHistory() {
  return api.get<CompanyStatusHistory[]>(
    "/company-status-history",
  );
}


export function createCompanyStatusHistory(
  data: Omit<
    CompanyStatusHistory,
    "id" | "changed_at"
  >,
) {
  return api.post<CompanyStatusHistory>(
    "/company-status-history",
    data,
  );
}


export function updateCompanyStatusHistory(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyStatusHistory,
      "id" | "changed_at"
    >
  >,
) {
  return api.put<CompanyStatusHistory>(
    `/company-status-history/${id}`,
    data,
  );
}


export function deleteCompanyStatusHistory(
  id: ApiId,
) {
  return api.delete(
    `/company-status-history/${id}`,
  );
}


/* =========================================================
   COMPANY USERS
========================================================= */

export type CompanyUser = {
  id: number;
  uuid: string;

  company_id: number;

  username: string;
  email: string | null;

  first_name: string;
  last_name: string | null;
  phone: string | null;

  status: string;

  last_login_at: string | null;
  password_changed_at: string | null;

  failed_login_attempts: number;

  locked_until: string | null;

  created_at: string;
  updated_at: string;
};


export function getCompanyUsers() {
  return api.get<CompanyUser[]>(
    "/company-users",
  );
}


export function createCompanyUser(
  data: {
    company_id: number;
    username: string;
    email?: string | null;

    password_hash: string;

    first_name: string;
    last_name?: string | null;

    phone?: string | null;

    status?: string;
  },
) {
  return api.post<CompanyUser>(
    "/company-users",
    data,
  );
}


export function updateCompanyUser(
  id: ApiId,
  data: Partial<{
    username: string;
    email: string | null;

    first_name: string;
    last_name: string | null;

    phone: string | null;

    status: string;
  }>,
) {
  return api.put<CompanyUser>(
    `/company-users/${id}`,
    data,
  );
}


export function deleteCompanyUser(
  id: ApiId,
) {
  return api.delete(
    `/company-users/${id}`,
  );
}


/* =========================================================
   USERNAME RULES
========================================================= */

export type UsernameRule = {
  id: number;

  company_id: number;

  min_length: number;
  max_length: number;

  allow_numbers: boolean;
  allow_special_characters: boolean;

  require_unique: boolean;

  pattern: string | null;

  created_at: string;
  updated_at: string;
};


export function getUsernameRules() {
  return api.get<UsernameRule[]>(
    "/username-rules",
  );
}


export function createUsernameRule(
  data: Omit<
    UsernameRule,
    "id" | "created_at" | "updated_at"
  >,
) {
  return api.post<UsernameRule>(
    "/username-rules",
    data,
  );
}


export function updateUsernameRule(
  id: ApiId,
  data: Partial<
    Omit<
      UsernameRule,
      "id" | "created_at" | "updated_at"
    >
  >,
) {
  return api.put<UsernameRule>(
    `/username-rules/${id}`,
    data,
  );
}


export function deleteUsernameRule(
  id: ApiId,
) {
  return api.delete(
    `/username-rules/${id}`,
  );
}


/* =========================================================
   BRANCHES
========================================================= */

export type CompanyBranch = {
  id: number;
  uuid: string;

  company_id: number;

  branch_code: string;
  branch_name: string;

  address_id: number | null;

  status: string;

  created_at: string;
  updated_at: string;
};


export function getCompanyBranches() {
  return api.get<CompanyBranch[]>(
    "/company-branches",
  );
}


export function createCompanyBranch(
  data: Omit<
    CompanyBranch,
    "id" | "uuid" | "created_at" | "updated_at"
  >,
) {
  return api.post<CompanyBranch>(
    "/company-branches",
    data,
  );
}


export function updateCompanyBranch(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyBranch,
      "id" | "uuid" | "created_at" | "updated_at"
    >
  >,
) {
  return api.put<CompanyBranch>(
    `/company-branches/${id}`,
    data,
  );
}


export function deleteCompanyBranch(
  id: ApiId,
) {
  return api.delete(
    `/company-branches/${id}`,
  );
}


/* =========================================================
   WAREHOUSES
========================================================= */

export type CompanyWarehouse = {
  id: number;
  uuid: string;

  company_id: number;
  branch_id: number;

  warehouse_code: string;
  warehouse_name: string;

  status: string;

  created_at: string;
  updated_at: string;
};


export function getCompanyWarehouses() {
  return api.get<CompanyWarehouse[]>(
    "/company-warehouses",
  );
}


export function createCompanyWarehouse(
  data: Omit<
    CompanyWarehouse,
    "id" | "uuid" | "created_at" | "updated_at"
  >,
) {
  return api.post<CompanyWarehouse>(
    "/company-warehouses",
    data,
  );
}


export function updateCompanyWarehouse(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyWarehouse,
      "id" | "uuid" | "created_at" | "updated_at"
    >
  >,
) {
  return api.put<CompanyWarehouse>(
    `/company-warehouses/${id}`,
    data,
  );
}


export function deleteCompanyWarehouse(
  id: ApiId,
) {
  return api.delete(
    `/company-warehouses/${id}`,
  );
}


/* =========================================================
   DEVICES
========================================================= */

export type CompanyDevice = {
  id: number;
  uuid: string;

  company_id: number;
  branch_id: number | null;

  device_code: string;
  device_name: string | null;

  device_type: string;

  platform: string | null;
  app_version: string | null;

  last_seen_at: string | null;

  status: string;

  device_metadata: Record<
    string,
    unknown
  > | null;

  created_at: string;
  updated_at: string;
};


export function getCompanyDevices() {
  return api.get<CompanyDevice[]>(
    "/company-devices",
  );
}


export function createCompanyDevice(
  data: Omit<
    CompanyDevice,
    "id" | "uuid" | "created_at" | "updated_at"
  >,
) {
  return api.post<CompanyDevice>(
    "/company-devices",
    data,
  );
}


export function updateCompanyDevice(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyDevice,
      "id" | "uuid" | "created_at" | "updated_at"
    >
  >,
) {
  return api.put<CompanyDevice>(
    `/company-devices/${id}`,
    data,
  );
}


export function deleteCompanyDevice(
  id: ApiId,
) {
  return api.delete(
    `/company-devices/${id}`,
  );
}


/* =========================================================
   TERMINALS
========================================================= */

export type CompanyTerminal = {
  id: number;
  uuid: string;

  company_id: number;
  branch_id: number;

  terminal_code: string;
  terminal_name: string;

  device_id: number | null;

  status: string;

  created_at: string;
  updated_at: string;
};


export function getCompanyTerminals() {
  return api.get<CompanyTerminal[]>(
    "/company-terminals",
  );
}


export function createCompanyTerminal(
  data: Omit<
    CompanyTerminal,
    "id" | "uuid" | "created_at" | "updated_at"
  >,
) {
  return api.post<CompanyTerminal>(
    "/company-terminals",
    data,
  );
}


export function updateCompanyTerminal(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyTerminal,
      "id" | "uuid" | "created_at" | "updated_at"
    >
  >,
) {
  return api.put<CompanyTerminal>(
    `/company-terminals/${id}`,
    data,
  );
}


export function deleteCompanyTerminal(
  id: ApiId,
) {
  return api.delete(
    `/company-terminals/${id}`,
  );
}


/* =========================================================
   TAX SETTINGS
========================================================= */

export type CompanyTaxSetting = {
  id: number;
  uuid: string;

  company_id: number;
  country_id: number;

  tax_registration_number: string | null;

  tax_system_name: string;

  default_tax_rate: number;

  tax_inclusive: boolean;
  tax_enabled: boolean;

  tax_configuration: Record<
    string,
    unknown
  > | null;

  effective_from: string;
  effective_to: string | null;

  status: string;

  created_by: number | null;
  updated_by: number | null;

  created_at: string;
  updated_at: string;
};


export function getCompanyTaxSettings() {
  return api.get<CompanyTaxSetting[]>(
    "/company-tax-settings",
  );
}


export function createCompanyTaxSetting(
  data: Omit<
    CompanyTaxSetting,
    | "id"
    | "uuid"
    | "created_at"
    | "updated_at"
  >,
) {
  return api.post<CompanyTaxSetting>(
    "/company-tax-settings",
    data,
  );
}


export function updateCompanyTaxSetting(
  id: ApiId,
  data: Partial<
    Omit<
      CompanyTaxSetting,
      | "id"
      | "uuid"
      | "created_at"
      | "updated_at"
    >
  >,
) {
  return api.put<CompanyTaxSetting>(
    `/company-tax-settings/${id}`,
    data,
  );
}


export function deleteCompanyTaxSetting(
  id: ApiId,
) {
  return api.delete(
    `/company-tax-settings/${id}`,
  );
}