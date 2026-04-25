'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, type UserRole } from '../context-api/UserContext';

interface SubMenuItem {
  href: string;
  label: string;
  description: string;
}

interface NavItem {
  href: string;
  label: string;
  description: string;
  accentClassName: string;
  icon: React.ReactNode;
  roles: UserRole[];
  children?: SubMenuItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function hasAccess(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        href: '/dashboard/my-dashboard',
        label: 'Dashboard',
        description: 'Executive summary and activity view',
        accentClassName: 'from-slate-700 to-slate-500',
        roles: ['Super Admin', 'Admin', 'Manager', 'User'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Assets',
    items: [
      {
        href: '/dashboard/devices',
        label: 'Asset',
        description: 'Browse registered devices and status',
        accentClassName: 'from-blue-600 to-cyan-500',
        roles: ['Super Admin', 'Admin', 'Manager', 'User'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
          </svg>
        ),
        children: [
          {
            href: '/dashboard/devices',
            label: 'All Asset',
            description: 'View and manage all registered assets',
          },
          {
            href: '/dashboard/devices/add',
            label: 'Add Asset',
            description: 'Add a new managed endpoint',
          },
          {
            href: '/dashboard/devices/archived',
            label: 'Achived',
            description: 'Add a new managed endpoint',
          },
          {
            href: '/dashboard/devices/in-repair',
            label: 'In Repair',
            description: 'Add a new managed endpoint',
          },
          {
            href: '/dashboard/devices/in-store',
            label: 'In Store',
            description: 'Add a new managed endpoint',
          },
          {
            href: '/dashboard/devices/add',
            label: 'Register Asset',
            description: 'Add a new managed endpoint',
          },
          {
            href: '/dashboard/devices/categories',
            label: 'Category Management',
            description: 'Define and organize asset types',
          },
          {
            href: '/dashboard/devices/analytics',
            label: 'Asset Analytics',
            description: 'View asset performance and trends',  
          },
          {
            href: '/dashboard/devices/stock-analytics',
            label: 'Stock Analytics',
            description: 'View stock performance and trends',  
          },
        ]
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        href: '/dashboard/users',
        label: 'Users & Roles',
        description: 'Control access and account health',
        accentClassName: 'from-emerald-600 to-teal-500',
        roles: ['Super Admin', 'Admin'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        children: [
          {
            href: '/dashboard/users/add',
            label: 'Invite User',
            description: 'Create an operator account',
          },
        ],
      },
    ],
  },
  {
    title: 'Maintenance & Lifecycle',
    items: [
      {
        href: '/dashboard/maintenance',
        label: 'Maintenance / Repairs',
        description: 'Schedule and track maintenance activities',
        accentClassName: 'from-emerald-600 to-teal-500',
        roles: ['Super Admin', 'Admin'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        children: [
          {
            href: '/dashboard/maintenance/asset-lifecycle',
            label: 'Asset Lifecycle',
            description: 'Track asset from acquisition to retirement',
          },
        ],
      },
    ],
  },
  {
    title: 'Reports & Analytics',
    items: [
      {
        href: '/dashboard/reports',
        label: 'Reports & Analytics',
        description: 'Schedule and track maintenance activities',
        accentClassName: 'from-emerald-600 to-teal-500',
        roles: ['Super Admin', 'Admin'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Vendors & Procurement',
    items: [
      {
        href: '/dashboard/vendors',
        label: 'Vendors / Procurement',
        description: 'Schedule and track maintenance activities',
        accentClassName: 'from-emerald-600 to-teal-500',
        roles: ['Super Admin', 'Admin'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        children: [
          {
            href: '/dashboard/vendors',
            label: 'Vendor List & Contacts',
            description: 'Manage vendor relationships and contacts',
          },
           {
            href: '/dashboard/vendors/purchase-orders',
            label: 'Purchase orders',
            description: 'View and manage procurement orders', 
          },
          {
            href: '/dashboard/vendors/asset-sourcing-history',
            label: 'Asset sourcing history',
            description: 'Track where assets were sourced and from which vendors', 
          },
        ],
      },
    ]
  },
   {
    title: 'Security & Compliance',
    items: [
      {
        href: '/dashboard/settings',
        label: 'Settings',
        description: 'Configure system settings and preferences',
        accentClassName: 'from-emerald-600 to-teal-500',
        roles: ['Super Admin', 'Admin'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        children: [
          {
            href: '/dashboard/settings/roles-permissions',
            label: 'Roles & permissions',
            description: 'Define user roles and access levels',
          },
           {
            href: '/dashboard/settings/asset-fields-customization',
            label: 'Asset fields customization',
            description: 'Customize asset attributes and data fields', 
          },
          {
            href: '/dashboard/settings/audit-logs',
            label: 'Audit logs',
            description: 'View system activity and changes for compliance', 
          },
        ],
      },
    ]
  },
  {
    title: 'Audit & Logs',
    items: [
      {
        href: '/dashboard/audit-logs',
        label: 'Audit & Logs',
        description: 'View system activity and audit logs for compliance',
        accentClassName: 'from-emerald-600 to-teal-500',
        roles: ['Super Admin', 'Admin'],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        children: [
          {
            href: '/dashboard/audit-logs/activity-logs',
            label: 'Activity logs',
            description: 'View user activity and system events for auditing',
          },
           {
            href: '/dashboard/audit-logs/asset-history-tracking',
            label: 'Asset history tracking',
            description: 'Track changes and history of individual assets for accountability', 
          },
        ],
      },
    ]
  },
];
  

export default function DashboardMenu() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const userRole = user?.role;

  // Derive auto-expanded parents based on active child route (pure computation)
  const autoExpanded = useMemo(() => {
    const set = new Set<string>();
    navigationGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((child) => pathname === child.href)) {
          set.add(item.href);
        }
      });
    });
    return set;
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const filteredGroups = useMemo(() => {
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasAccess(userRole, item.roles)),
      }))
      .filter((group) => group.items.length > 0);
  }, [userRole]);

  return (
    <aside
      className={`shrink-0 transition-all duration-300 ease-in-out lg:sticky lg:top-6 ${
        isCollapsed ? 'lg:w-18' : 'lg:w-80'
      }`}
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-white px-0 py-2 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">RevLock</p>
            <p className="text-xs text-slate-500">Console</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu Content */}
      <div
        className={`overflow-hidden border-x border-slate-200/70 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] transition-all duration-300 ease-in-out lg:overflow-y-auto lg:border ${
          isMobileMenuOpen ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
        }`}
      >
        {/* Desktop Brand + Collapse Toggle */}
        <div className="hidden items-center justify-end border-b border-white/10 px-5 py-0 lg:flex">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            >
              <path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" />
            </svg>
          </button>
        </div>

        <div className={`space-y-6 px-4 h-screen overflow-y-auto py-5 ${isCollapsed ? 'lg:px-2 lg:py-4' : ''}`}>
          {filteredGroups.map((group) => (
            <section key={group.title}>
              {/* <p className={`px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                {group.title}
              </p> */}
              <nav className={`mt-3 space-y-2 ${isCollapsed ? 'lg:mt-0 lg:space-y-3' : ''}`}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const isChildActive = item.children?.some((child) => pathname === child.href);
                  const isExpanded = expandedItems.has(item.href) || autoExpanded.has(item.href);
                  const hasChildren = (item.children?.length ?? 0) > 0;

                  return (
                    <div key={item.href}>
                      {/* Collapsed desktop: icon only */}
                      <div
                        className={`group relative flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition ${
                          isActive || isChildActive
                            ? 'border-cyan-400/40 bg-white/10'
                            : 'border-white/8 bg-white/5 hover:bg-white/10'
                        } ${isCollapsed ? 'lg:items-center lg:justify-center lg:px-2 lg:py-2.5' : ''}`}
                      >
                        {/* Active indicator */}
                        {(isActive || isChildActive) && (
                          <span className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 ${isCollapsed ? 'lg:hidden' : ''}`} />
                        )}

                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-start gap-3 ${isCollapsed ? 'lg:items-center lg:justify-center' : 'flex-1'}`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${item.accentClassName} text-white shadow-sm ${isCollapsed ? 'lg:h-9 lg:w-9' : ''}`}>
                            {item.icon}
                          </div>
                          <div className={`min-w-0 transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="mt-0.5 text-sm text-slate-300">{item.description}</p>
                          </div>
                        </Link>

                        {/* Expand / Chevron */}
                        <div className={`flex items-center gap-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                          {(isActive || isChildActive) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          )}
                          {hasChildren && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item.href);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                              aria-label={isExpanded ? 'Collapse submenu' : 'Expand submenu'}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Submenu */}
                      {hasChildren && (
                        <div
                          className={`overflow-hidden transition-all duration-200 ease-in-out ${
                            isExpanded ? 'opacity-100' : 'max-h-0 opacity-0'
                          } ${isCollapsed ? 'lg:hidden' : ''}`}
                        >
                          <div className="mt-1 ml-6 space-y-1 border-l border-white/10 pl-4">
                            {item.children?.map((child) => {
                              const childActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex flex-col rounded-xl px-3 py-2.5 transition ${
                                    childActive
                                      ? 'bg-cyan-400/10 text-cyan-200'
                                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <span className="text-sm font-medium">{child.label}</span>
                                  <span className="text-xs text-slate-400">{child.description}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        {/* Session Card */}
        <div className={`mx-4 mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 ${isCollapsed ? 'lg:mx-2 lg:flex lg:justify-center lg:p-2' : ''}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 ${isCollapsed ? 'lg:hidden' : ''}`}>
            Active Session
          </p>
          {user && (
            <div className={`mt-3 flex items-center gap-3 ${isCollapsed ? 'lg:mt-0' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white" title={user.name}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={`min-w-0 transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-300">{user.email}</p>
              </div>
            </div>
          )}
          {user && (
            <div className={`mt-3 inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
              {user.role}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

