# Backend Integration Implementation Plan

## Phase 1: Database Models & Core APIs

### Models
- [ ] src/models/Vendor.ts
- [ ] src/models/PurchaseOrder.ts
- [ ] src/models/AssetCategory.ts
- [ ] src/models/MaintenanceRecord.ts
- [ ] src/models/AuditLog.ts
- [ ] src/models/ActivityLog.ts
- [ ] src/models/AssetField.ts

### APIs
- [ ] src/app/api/vendors/route.ts (GET/POST)
- [ ] src/app/api/vendors/[id]/route.ts (GET/PUT/DELETE)
- [ ] src/app/api/purchase-orders/route.ts (GET/POST)
- [ ] src/app/api/purchase-orders/[id]/route.ts (GET/PUT/DELETE)
- [ ] src/app/api/categories/route.ts (GET/POST)
- [ ] src/app/api/categories/[id]/route.ts (GET/PUT/DELETE)
- [ ] src/app/api/maintenance/route.ts (GET/POST)
- [ ] src/app/api/maintenance/[id]/route.ts (GET/PUT/DELETE)
- [ ] src/app/api/audit-logs/route.ts (GET)
- [ ] src/app/api/activity-logs/route.ts (GET)
- [ ] src/app/api/asset-fields/route.ts (GET/POST/PUT/DELETE)
- [ ] src/app/api/dashboard/stats/route.ts (GET)
- [ ] Enhance /api/devices with pagination, search, filters
- [ ] Enhance /api/users with pagination, search

## Phase 2: Reusable Components
- [ ] src/components/ui/DataTable.tsx
- [ ] src/components/ui/StatCard.tsx
- [ ] src/components/ui/PageHeader.tsx
- [ ] src/components/ui/LoadingSkeleton.tsx
- [ ] src/components/ui/ConfirmModal.tsx
- [ ] src/components/ui/ToastProvider.tsx

## Phase 3: Page Implementations

### Devices Section (8 pages)
- [ ] src/app/dashboard/devices/page.tsx — Full listing with DataTable
- [ ] src/app/dashboard/devices/[id]/page.tsx — Detail & edit view
- [ ] src/app/dashboard/devices/add/page.tsx — Style to glassmorphism theme
- [ ] src/app/dashboard/devices/archived/page.tsx
- [ ] src/app/dashboard/devices/in-repair/page.tsx
- [ ] src/app/dashboard/devices/in-store/page.tsx
- [ ] src/app/dashboard/devices/categories/page.tsx
- [ ] src/app/dashboard/devices/analytics/page.tsx
- [ ] src/app/dashboard/devices/stock-analytics/page.tsx

### Users Section (2 pages - style update)
- [ ] src/app/dashboard/users/page.tsx — Glassmorphism theme
- [ ] src/app/dashboard/users/add/page.tsx — Glassmorphism theme

### Maintenance Section (2 pages)
- [ ] src/app/dashboard/maintenance/page.tsx
- [ ] src/app/dashboard/maintenance/asset-lifecycle/page.tsx

### Vendors Section (3 pages)
- [ ] src/app/dashboard/vendors/page.tsx
- [ ] src/app/dashboard/vendors/purchase-orders/page.tsx
- [ ] src/app/dashboard/vendors/asset-sourcing-history/page.tsx

### Reports (1 page)
- [ ] src/app/dashboard/reports/page.tsx

### Settings Section (4 pages)
- [ ] src/app/dashboard/settings/page.tsx
- [ ] src/app/dashboard/settings/roles-permissions/page.tsx
- [ ] src/app/dashboard/settings/asset-fields-customization/page.tsx
- [ ] src/app/dashboard/settings/audit-logs/page.tsx

### Audit & Logs Section (3 pages)
- [ ] src/app/dashboard/audit-logs/page.tsx
- [ ] src/app/dashboard/audit-logs/activity-logs/page.tsx
- [ ] src/app/dashboard/audit-logs/asset-history-tracking/page.tsx

### Dashboard
- [ ] src/app/dashboard/my-dashboard/page.tsx — Real stats from API

## Phase 4: Polish & Fixes
- [ ] Seed script for demo data
- [ ] Middleware updates for new routes
- [ ] Mobile responsiveness verification
- [ ] TypeScript build check
- [ ] DashboardHeader page titles update

