<?php

use Illuminate\Support\Facades\Route;

// =====================================================
// COUNTRIES & CURRENCIES
// =====================================================
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\CurrencyController;

Route::apiResource('countries', CountryController::class);
Route::apiResource('currencies', CurrencyController::class);


// =====================================================
// PLATFORM SETTINGS & CONFIGS
// =====================================================
use App\Http\Controllers\Api\PlatformSettingController;
use App\Http\Controllers\Api\PlatformConfigController;
use App\Http\Controllers\Api\PlatformModuleController;
use App\Http\Controllers\Api\PlatformFeatureController;
use App\Http\Controllers\Api\FeatureFlagController;

Route::apiResource('platform-settings', PlatformSettingController::class);
Route::apiResource('platform-configs', PlatformConfigController::class);
Route::apiResource('platform-modules', PlatformModuleController::class);
Route::apiResource('platform-features', PlatformFeatureController::class);
Route::apiResource('feature-flags', FeatureFlagController::class);


// =====================================================
// PLATFORM ADMINS & ACCESS CONTROL
// =====================================================
use App\Http\Controllers\Api\PlatformAdminController;
use App\Http\Controllers\Api\PlatformAdminRoleController;
use App\Http\Controllers\Api\PlatformPermissionController;
use App\Http\Controllers\Api\PlatformRolePermissionController;
use App\Http\Controllers\Api\PlatformAdminUserRoleController;
use App\Http\Controllers\Api\PlatformAdminSessionController;
use App\Http\Controllers\Api\PlatformAdminLoginLogController;

Route::apiResource('platform-admins', PlatformAdminController::class);
Route::apiResource('platform-admin-roles', PlatformAdminRoleController::class);
Route::apiResource('platform-permissions', PlatformPermissionController::class);
Route::apiResource('platform-role-permissions', PlatformRolePermissionController::class);
Route::apiResource('platform-admin-user-roles', PlatformAdminUserRoleController::class);
Route::apiResource('platform-admin-sessions', PlatformAdminSessionController::class);
Route::apiResource('platform-admin-login-logs', PlatformAdminLoginLogController::class);


// =====================================================
// COMPANIES & BRANCHES
// =====================================================
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CompanySettingController;
use App\Http\Controllers\Api\CompanyContactController;
use App\Http\Controllers\Api\CompanyAddressController;
use App\Http\Controllers\Api\CompanyStatusHistoryController;
use App\Http\Controllers\Api\CompanyUserController;
use App\Http\Controllers\Api\UsernameRuleController;
use App\Http\Controllers\Api\CompanyBranchController;
use App\Http\Controllers\Api\CompanyWarehouseController;
use App\Http\Controllers\Api\CompanyDeviceController;
use App\Http\Controllers\Api\CompanyTerminalController;
use App\Http\Controllers\Api\CompanyTaxSettingController;

Route::apiResource('companies', CompanyController::class);
Route::apiResource('company-settings', CompanySettingController::class);
Route::apiResource('company-contacts', CompanyContactController::class);
Route::apiResource('company-addresses', CompanyAddressController::class);
Route::apiResource('company-status-history', CompanyStatusHistoryController::class);
Route::apiResource('company-users', CompanyUserController::class);
Route::apiResource('username-rules', UsernameRuleController::class);
Route::apiResource('company-branches', CompanyBranchController::class);
Route::apiResource('company-warehouses', CompanyWarehouseController::class);
Route::apiResource('company-devices', CompanyDeviceController::class);
Route::apiResource('company-terminals', CompanyTerminalController::class);
Route::apiResource('company-tax-settings', CompanyTaxSettingController::class);


// =====================================================
// SUBSCRIPTION PLANS
// =====================================================
use App\Http\Controllers\Api\SubscriptionPlanController;
use App\Http\Controllers\Api\SubscriptionPlanLimitController;
use App\Http\Controllers\Api\SubscriptionPlanModuleController;
use App\Http\Controllers\Api\SubscriptionPlanFeatureController;

Route::apiResource('subscription-plans', SubscriptionPlanController::class);
Route::apiResource('subscription-plan-limits', SubscriptionPlanLimitController::class);
Route::apiResource('subscription-plan-modules', SubscriptionPlanModuleController::class);
Route::apiResource('subscription-plan-features', SubscriptionPlanFeatureController::class);


// =====================================================
// PHASE 06 — COMPANY SUBSCRIPTIONS & LIMITS
// =====================================================
use App\Http\Controllers\Api\CompanySubscriptionController;
use App\Http\Controllers\Api\SubscriptionLimitSnapshotController;
use App\Http\Controllers\Api\SubscriptionUsageController;
use App\Http\Controllers\Api\SubscriptionUsageLogController;
use App\Http\Controllers\Api\SubscriptionAddonController;
use App\Http\Controllers\Api\CompanySubscriptionAddonController;
use App\Http\Controllers\Api\SubscriptionTrialController;
use App\Http\Controllers\Api\SubscriptionGracePeriodController;
use App\Http\Controllers\Api\SubscriptionChangeController;
use App\Http\Controllers\Api\CompanyLimitOverrideController;

Route::apiResource('company-subscriptions', CompanySubscriptionController::class);
Route::apiResource('subscription-limit-snapshots', SubscriptionLimitSnapshotController::class);
Route::apiResource('subscription-usage', SubscriptionUsageController::class);
Route::apiResource('subscription-usage-logs', SubscriptionUsageLogController::class);
Route::apiResource('subscription-addons', SubscriptionAddonController::class);
Route::apiResource('company-subscription-addons', CompanySubscriptionAddonController::class);
Route::apiResource('subscription-trials', SubscriptionTrialController::class);
Route::apiResource('subscription-grace-periods', SubscriptionGracePeriodController::class);
Route::apiResource('subscription-changes', SubscriptionChangeController::class);
Route::apiResource('company-limit-overrides', CompanyLimitOverrideController::class);


// =====================================================
// PHASES 07 TO 11 (Billing, Gateways, ECR, API, Notifications)
// =====================================================
use App\Http\Controllers\Api\Phase7BillingController;
use App\Http\Controllers\Api\Phase8GatewayController;
use App\Http\Controllers\Api\Phase9EcrController;
use App\Http\Controllers\Api\Phase10ApiClientController;
use App\Http\Controllers\Api\Phase11NotificationController;

// Removed Route::prefix('v1') so it matches /api/invoices directly
// Phase 07: Billing & Payments
Route::get('/invoices', [Phase7BillingController::class, 'indexInvoices']);
Route::post('/invoices', [Phase7BillingController::class, 'storeInvoice']);
Route::get('/invoices/{id}', [Phase7BillingController::class, 'showInvoice']);
Route::post('/payments', [Phase7BillingController::class, 'recordPayment']);

// Phase 08: Payment Gateways
Route::get('/payment-gateways', [Phase8GatewayController::class, 'index']);
Route::post('/company-payment-gateways', [Phase8GatewayController::class, 'configureCompanyGateway']);

// Phase 09: ECR Integration
Route::get('/ecr/providers', [Phase9EcrController::class, 'getProviders']);
Route::get('/ecr/terminals', [Phase9EcrController::class, 'getTerminals']);
Route::post('/ecr/terminals', [Phase9EcrController::class, 'mapTerminal']);

// Phase 10: API Management
Route::get('/api-clients', [Phase10ApiClientController::class, 'index']);
Route::post('/api-clients', [Phase10ApiClientController::class, 'store']);

// Phase 11: Notifications
Route::get('/notifications', [Phase11NotificationController::class, 'index']);
Route::post('/notifications/{id}/read', [Phase11NotificationController::class, 'markRead']);