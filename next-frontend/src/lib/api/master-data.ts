import { api } from "./client";

export type ApiId = number | string;
export type Country = { id:number; uuid:string; country_code:string; country_name:string; phone_code:string|null; is_active:boolean; created_at:string; updated_at:string };
export type Currency = { id:number; uuid:string; currency_code:string; currency_name:string; symbol:string|null; decimal_places:number; is_active:boolean; created_at:string; updated_at:string };

export const getCountries = () => api.get<Country[]>("/countries");
export const getCountry = (id:ApiId) => api.get<Country>(`/countries/${id}`);
export const createCountry = (data:Partial<Country>) => api.post<Country>("/countries", data);
export const updateCountry = (id:ApiId,data:Partial<Country>) => api.put<Country>(`/countries/${id}`, data);
export const deleteCountry = (id:ApiId) => api.delete(`/countries/${id}`);

export const getCurrencies = () => api.get<Currency[]>("/currencies");
export const getCurrency = (id:ApiId) => api.get<Currency>(`/currencies/${id}`);
export const createCurrency = (data:Partial<Currency>) => api.post<Currency>("/currencies", data);
export const updateCurrency = (id:ApiId,data:Partial<Currency>) => api.put<Currency>(`/currencies/${id}`, data);
export const deleteCurrency = (id:ApiId) => api.delete(`/currencies/${id}`);
