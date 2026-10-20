import { api } from "./client";

/* =========================================================
   COMPANY TYPES
========================================================= */

export type Company = {
  id: number;
  uuid: string;

  company_code: string;
  company_name: string;

  legal_name: string | null;
  tax_number: string | null;

  country_id: number | null;
  currency_id: number | null;

  timezone: string;

  status: string;

  database_identifier: string | null;

  created_at: string;
  updated_at: string;

  deleted_at: string | null;
};


export type CreateCompanyPayload = {
  company_code: string;
  company_name: string;

  legal_name?: string | null;
  tax_number?: string | null;

  country_id?: number | null;
  currency_id?: number | null;

  timezone: string;

  status?: string;

  database_identifier?: string | null;
};


export type UpdateCompanyPayload =
  Partial<CreateCompanyPayload>;


/* =========================================================
   GET ALL COMPANIES
========================================================= */

export async function getCompanies() {
  return api.get<Company[]>(
    "/companies",
  );
}


/* =========================================================
   GET SINGLE COMPANY
========================================================= */

export async function getCompany(
  id: number | string,
) {
  return api.get<Company>(
    `/companies/${id}`,
  );
}


/* =========================================================
   CREATE COMPANY
========================================================= */

export async function createCompany(
  data: CreateCompanyPayload,
) {
  return api.post<Company>(
    "/companies",
    data,
  );
}


/* =========================================================
   UPDATE COMPANY
========================================================= */

export async function updateCompany(
  id: number | string,
  data: UpdateCompanyPayload,
) {
  return api.put<Company>(
    `/companies/${id}`,
    data,
  );
}


/* =========================================================
   DELETE COMPANY
========================================================= */

export async function deleteCompany(
  id: number | string,
) {
  return api.delete<{
    message: string;
  }>(
    `/companies/${id}`,
  );
}