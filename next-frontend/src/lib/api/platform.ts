import { api } from "./client";

export type ApiId = number | string;
export type ApiEnvelope<T> = T;

export type PlatformSetting = { id:number; setting_key:string; setting_value:string|null; value_type:string|null; description:string|null; is_public:boolean; created_at:string; updated_at:string };
export type PlatformConfig = { id:number; config_group:string; config_key:string; config_value:Record<string,unknown>|null; environment:string; is_encrypted:boolean; created_at:string; updated_at:string };
export type PlatformModule = { id:number; module_code:string; module_name:string; description:string|null; version:string|null; is_active:boolean; sort_order:number; created_at:string; updated_at:string; features?: PlatformFeature[] };
export type PlatformFeature = { id:number; module_id:number; feature_code:string; feature_name:string; description:string|null; is_active:boolean; created_at:string; updated_at:string; module?: PlatformModule; featureFlag?: FeatureFlag|null };
export type FeatureFlag = { id:number; feature_id:number; flag_key:string; is_enabled:boolean; rollout_percentage:number; conditions:Record<string,unknown>|null; created_at:string; updated_at:string; feature?:PlatformFeature };
export type PlatformAdmin = { id:number; uuid:string; username:string; email:string; first_name:string; last_name:string|null; phone:string|null; status:string; last_login_at:string|null; password_changed_at:string|null; failed_login_attempts:number; locked_until:string|null; created_at:string; updated_at:string };
export type PlatformAdminRole = { id:number; uuid:string; role_code:string; role_name:string; description:string|null; is_system_role:boolean; is_active:boolean; created_at:string; updated_at:string };
export type PlatformPermission = { id:number; permission_code:string; permission_name:string; module:string|null; action:string|null; description:string|null; created_at:string; updated_at:string };
export type PlatformRolePermission = { id:number; role_id:number; permission_id:number; created_at:string };
export type PlatformAdminUserRole = { id:number; admin_id:number; role_id:number; created_at:string };
export type PlatformAdminSession = { id:number; uuid:string; admin_id:number; token_hash:string; ip_address:string|null; user_agent:string|null; device_info:Record<string,unknown>|null; expires_at:string|null; last_activity_at:string|null; revoked_at:string|null; created_at:string };
export type PlatformAdminLoginLog = { id:number; admin_id:number|null; username:string|null; login_status:string; ip_address:string|null; user_agent:string|null; failure_reason:string|null; logged_at:string };

export const getPlatformSettings = () => api.get<PlatformSetting[]>("/platform-settings");
export const getPlatformSetting = (id:ApiId) => api.get<PlatformSetting>(`/platform-settings/${id}`);
export const createPlatformSetting = (data:Partial<PlatformSetting>) => api.post<PlatformSetting>("/platform-settings", data);
export const updatePlatformSetting = (id:ApiId,data:Partial<PlatformSetting>) => api.put<PlatformSetting>(`/platform-settings/${id}`, data);
export const deletePlatformSetting = (id:ApiId) => api.delete(`/platform-settings/${id}`);

export const getPlatformConfigs = () => api.get<PlatformConfig[]>("/platform-configs");
export const getPlatformConfig = (id:ApiId) => api.get<PlatformConfig>(`/platform-configs/${id}`);
export const createPlatformConfig = (data:Partial<PlatformConfig>) => api.post<PlatformConfig>("/platform-configs", data);
export const updatePlatformConfig = (id:ApiId,data:Partial<PlatformConfig>) => api.put<PlatformConfig>(`/platform-configs/${id}`, data);
export const deletePlatformConfig = (id:ApiId) => api.delete(`/platform-configs/${id}`);

export const getPlatformModules = () => api.get<PlatformModule[]>("/platform-modules");
export const getPlatformModule = (id:ApiId) => api.get<PlatformModule>(`/platform-modules/${id}`);
export const createPlatformModule = (data:Partial<PlatformModule>) => api.post<PlatformModule>("/platform-modules", data);
export const updatePlatformModule = (id:ApiId,data:Partial<PlatformModule>) => api.put<PlatformModule>(`/platform-modules/${id}`, data);
export const deletePlatformModule = (id:ApiId) => api.delete(`/platform-modules/${id}`);

export const getPlatformFeatures = () => api.get<PlatformFeature[]>("/platform-features");
export const getPlatformFeature = (id:ApiId) => api.get<PlatformFeature>(`/platform-features/${id}`);
export const createPlatformFeature = (data:Partial<PlatformFeature>) => api.post<PlatformFeature>("/platform-features", data);
export const updatePlatformFeature = (id:ApiId,data:Partial<PlatformFeature>) => api.put<PlatformFeature>(`/platform-features/${id}`, data);
export const deletePlatformFeature = (id:ApiId) => api.delete(`/platform-features/${id}`);

export const getFeatureFlags = () => api.get<FeatureFlag[]>("/feature-flags");
export const getFeatureFlag = (id:ApiId) => api.get<FeatureFlag>(`/feature-flags/${id}`);
export const createFeatureFlag = (data:Partial<FeatureFlag>) => api.post<FeatureFlag>("/feature-flags", data);
export const updateFeatureFlag = (id:ApiId,data:Partial<FeatureFlag>) => api.put<FeatureFlag>(`/feature-flags/${id}`, data);
export const deleteFeatureFlag = (id:ApiId) => api.delete(`/feature-flags/${id}`);

export const getPlatformAdmins = () => api.get<PlatformAdmin[]>("/platform-admins");
export const getPlatformAdmin = (id:ApiId) => api.get<PlatformAdmin>(`/platform-admins/${id}`);
export const createPlatformAdmin = (data:Partial<PlatformAdmin> & {password_hash?:string}) => api.post<PlatformAdmin>("/platform-admins", data);
export const updatePlatformAdmin = (id:ApiId,data:Partial<PlatformAdmin> & {password_hash?:string}) => api.put<PlatformAdmin>(`/platform-admins/${id}`, data);
export const deletePlatformAdmin = (id:ApiId) => api.delete(`/platform-admins/${id}`);

export const getPlatformAdminRoles = () => api.get<PlatformAdminRole[]>("/platform-admin-roles");
export const getPlatformAdminRole = (id:ApiId) => api.get<PlatformAdminRole>(`/platform-admin-roles/${id}`);
export const createPlatformAdminRole = (data:Partial<PlatformAdminRole>) => api.post<PlatformAdminRole>("/platform-admin-roles", data);
export const updatePlatformAdminRole = (id:ApiId,data:Partial<PlatformAdminRole>) => api.put<PlatformAdminRole>(`/platform-admin-roles/${id}`, data);
export const deletePlatformAdminRole = (id:ApiId) => api.delete(`/platform-admin-roles/${id}`);

export const getPlatformPermissions = () => api.get<PlatformPermission[]>("/platform-permissions");
export const getPlatformPermission = (id:ApiId) => api.get<PlatformPermission>(`/platform-permissions/${id}`);
export const createPlatformPermission = (data:Partial<PlatformPermission>) => api.post<PlatformPermission>("/platform-permissions", data);
export const updatePlatformPermission = (id:ApiId,data:Partial<PlatformPermission>) => api.put<PlatformPermission>(`/platform-permissions/${id}`, data);
export const deletePlatformPermission = (id:ApiId) => api.delete(`/platform-permissions/${id}`);

export const getPlatformRolePermissions = () => api.get<PlatformRolePermission[]>("/platform-role-permissions");
export const getPlatformRolePermission = (id:ApiId) => api.get<PlatformRolePermission>(`/platform-role-permissions/${id}`);
export const createPlatformRolePermission = (data:Partial<PlatformRolePermission>) => api.post<PlatformRolePermission>("/platform-role-permissions", data);
export const updatePlatformRolePermission = (id:ApiId,data:Partial<PlatformRolePermission>) => api.put<PlatformRolePermission>(`/platform-role-permissions/${id}`, data);
export const deletePlatformRolePermission = (id:ApiId) => api.delete(`/platform-role-permissions/${id}`);

export const getPlatformAdminUserRoles = () => api.get<PlatformAdminUserRole[]>("/platform-admin-user-roles");
export const getPlatformAdminUserRole = (id:ApiId) => api.get<PlatformAdminUserRole>(`/platform-admin-user-roles/${id}`);
export const createPlatformAdminUserRole = (data:Partial<PlatformAdminUserRole>) => api.post<PlatformAdminUserRole>("/platform-admin-user-roles", data);
export const updatePlatformAdminUserRole = (id:ApiId,data:Partial<PlatformAdminUserRole>) => api.put<PlatformAdminUserRole>(`/platform-admin-user-roles/${id}`, data);
export const deletePlatformAdminUserRole = (id:ApiId) => api.delete(`/platform-admin-user-roles/${id}`);

export const getPlatformAdminSessions = () => api.get<PlatformAdminSession[]>("/platform-admin-sessions");
export const getPlatformAdminSession = (id:ApiId) => api.get<PlatformAdminSession>(`/platform-admin-sessions/${id}`);
export const createPlatformAdminSession = (data:Partial<PlatformAdminSession>) => api.post<PlatformAdminSession>("/platform-admin-sessions", data);
export const updatePlatformAdminSession = (id:ApiId,data:Partial<PlatformAdminSession>) => api.put<PlatformAdminSession>(`/platform-admin-sessions/${id}`, data);
export const deletePlatformAdminSession = (id:ApiId) => api.delete(`/platform-admin-sessions/${id}`);

export const getPlatformAdminLoginLogs = () => api.get<PlatformAdminLoginLog[]>("/platform-admin-login-logs");
export const getPlatformAdminLoginLog = (id:ApiId) => api.get<PlatformAdminLoginLog>(`/platform-admin-login-logs/${id}`);
export const createPlatformAdminLoginLog = (data:Partial<PlatformAdminLoginLog>) => api.post<PlatformAdminLoginLog>("/platform-admin-login-logs", data);
export const updatePlatformAdminLoginLog = (id:ApiId,data:Partial<PlatformAdminLoginLog>) => api.put<PlatformAdminLoginLog>(`/platform-admin-login-logs/${id}`, data);
export const deletePlatformAdminLoginLog = (id:ApiId) => api.delete(`/platform-admin-login-logs/${id}`);
