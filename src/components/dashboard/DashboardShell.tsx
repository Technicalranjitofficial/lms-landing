"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, BarChart2, Megaphone,
  MessageSquare, Settings, FileText, DollarSign, Star,
  FolderOpen, Calendar, Tag, Inbox, Send, RefreshCcw,
  TrendingUp, ShoppingBag, Banknote, Award, Bookmark,
  Bell, LogOut, ChevronRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/AuthProvider";
import type { UserRole } from "@/types/next-auth";

// ─── shadcn components ────────────────────────────────────────────────────────
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem   { label: string; href: string; icon: React.ElementType; badge?: number }
interface NavGroup  { group: string; items: NavItem[] }

const NAV_GROUPS: Record<UserRole, NavGroup[]> = {
  SUPER_ADMIN: [
    { group: "Core", items: [
      { label: "Overview",  href: "/admin",         icon: LayoutDashboard },
      { label: "Users",     href: "/admin/users",   icon: Users           },
      { label: "Courses",   href: "/admin/courses", icon: BookOpen        },
      { label: "Orders",    href: "/admin/orders",  icon: ShoppingBag     },
    ]},
    { group: "Manage", items: [
      { label: "Finance",   href: "/admin/finance",   icon: BarChart2     },
      { label: "Coupons",   href: "/admin/coupons",   icon: Tag           },
      { label: "Marketing", href: "/admin/marketing", icon: Megaphone     },
      { label: "Support",   href: "/admin/support",   icon: MessageSquare },
    ]},
    { group: "System", items: [
      { label: "Settings",  href: "/admin/settings", icon: Settings },
      { label: "Audit Log", href: "/admin/audit",    icon: FileText },
    ]},
  ],
  ADMIN: [
    { group: "Core", items: [
      { label: "Overview",  href: "/admin",         icon: LayoutDashboard },
      { label: "Users",     href: "/admin/users",   icon: Users           },
      { label: "Courses",   href: "/admin/courses", icon: BookOpen        },
      { label: "Orders",    href: "/admin/orders",  icon: ShoppingBag     },
    ]},
    { group: "Manage", items: [
      { label: "Finance",   href: "/admin/finance",   icon: BarChart2     },
      { label: "Coupons",   href: "/admin/coupons",   icon: Tag           },
      { label: "Marketing", href: "/admin/marketing", icon: Megaphone     },
      { label: "Support",   href: "/admin/support",   icon: MessageSquare },
    ]},
    { group: "System", items: [
      { label: "Settings",  href: "/admin/settings", icon: Settings },
      { label: "Audit Log", href: "/admin/audit",    icon: FileText },
    ]},
  ],
  INSTRUCTOR: [
    { group: "Teaching", items: [
      { label: "Overview",   href: "/instructor",          icon: LayoutDashboard },
      { label: "My Courses", href: "/instructor/courses",  icon: BookOpen        },
      { label: "Students",   href: "/instructor/students", icon: Users           },
      { label: "Reviews",    href: "/instructor/reviews",  icon: Star            },
    ]},
    { group: "Business", items: [
      { label: "Earnings", href: "/instructor/earnings", icon: DollarSign },
      { label: "Media",    href: "/instructor/media",    icon: FolderOpen  },
    ]},
  ],
  MENTOR: [
    { group: "Mentoring", items: [
      { label: "Overview",    href: "/mentor",          icon: LayoutDashboard },
      { label: "My Students", href: "/mentor/students", icon: Users           },
      { label: "Sessions",    href: "/mentor/sessions", icon: Calendar        },
      { label: "Notes",       href: "/mentor/notes",    icon: FileText        },
    ]},
  ],
  MARKETING: [
    { group: "Marketing", items: [
      { label: "Overview",  href: "/marketing",           icon: LayoutDashboard },
      { label: "Coupons",   href: "/marketing/coupons",   icon: Tag             },
      { label: "Leads",     href: "/marketing/leads",     icon: Inbox           },
      { label: "Campaigns", href: "/marketing/campaigns", icon: Send            },
    ]},
  ],
  SUPPORT: [
    { group: "Support", items: [
      { label: "Overview", href: "/support",         icon: LayoutDashboard },
      { label: "Tickets",  href: "/support/tickets", icon: MessageSquare   },
      { label: "Refunds",  href: "/support/refunds", icon: RefreshCcw      },
    ]},
  ],
  FINANCE: [
    { group: "Finance", items: [
      { label: "Overview", href: "/finance",         icon: LayoutDashboard },
      { label: "Revenue",  href: "/finance/revenue", icon: TrendingUp      },
      { label: "Orders",   href: "/finance/orders",  icon: ShoppingBag     },
      { label: "Payouts",  href: "/finance/payouts", icon: Banknote        },
    ]},
  ],
  STUDENT: [
    { group: "Learning", items: [
      { label: "Overview",     href: "/dashboard",              icon: LayoutDashboard },
      { label: "My Courses",   href: "/dashboard/courses",      icon: BookOpen        },
      { label: "Certificates", href: "/dashboard/certificates", icon: Award           },
      { label: "Bookmarks",    href: "/dashboard/bookmarks",    icon: Bookmark        },
    ]},
    { group: "Account", items: [
      { label: "Orders",   href: "/dashboard/orders",   icon: ShoppingBag },
      { label: "Settings", href: "/dashboard/settings", icon: Settings    },
    ]},
  ],
};

const NAV_FLAT = Object.fromEntries(
  Object.entries(NAV_GROUPS).map(([r, g]) => [r, g.flatMap((x) => x.items)])
) as Record<UserRole, NavItem[]>;

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin", ADMIN: "Admin", INSTRUCTOR: "Instructor",
  MENTOR: "Mentor",           MARKETING: "Marketing",
  SUPPORT: "Support",         FINANCE: "Finance", STUDENT: "Student",
};

const ROLE_GRADIENT: Record<UserRole, string> = {
  SUPER_ADMIN: "from-rose-500 to-amber-500",
  ADMIN:       "from-violet-500 to-cyan-500",
  INSTRUCTOR:  "from-purple-500 to-violet-500",
  MENTOR:      "from-emerald-500 to-cyan-500",
  MARKETING:   "from-amber-500 to-rose-500",
  SUPPORT:     "from-cyan-500 to-violet-500",
  FINANCE:     "from-emerald-500 to-violet-500",
  STUDENT:     "from-violet-500 to-purple-500",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function isActive(href: string, pathname: string): boolean {
  const roots = ["/dashboard", "/admin", "/instructor", "/mentor", "/marketing", "/support", "/finance"];
  return href === pathname || (pathname.startsWith(href) && !roots.includes(href));
}

// ─── App Sidebar ──────────────────────────────────────────────────────────────
function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const groups    = NAV_GROUPS[role];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── Logo ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="CodePath Admin"
              render={
                <Link href="/" className="flex items-center gap-2.5 px-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
                    <Zap size={15} className="text-white" fill="white" />
                  </div>
                  <div className="leading-tight group-data-[collapsible=icon]:hidden">
                    <p className="font-display font-black text-sm tracking-tight">CodePath</p>
                    <p className="text-[0.58rem] font-semibold uppercase tracking-widest text-muted-foreground">
                      Admin Panel
                    </p>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent>
        <ScrollArea className="h-full px-2 py-2">
          {groups.map((group) => (
            <SidebarGroup key={group.group} className="mb-1 p-0">
              <SidebarGroupLabel className="px-2 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground/50">
                {group.group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon   = item.icon;
                    const active = isActive(item.href, pathname);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.label}
                          className={cn(
                            "relative h-9 rounded-xl font-medium transition-all duration-150",
                            active
                              ? "bg-primary/12 text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-r-full before:bg-gradient-to-b before:from-violet-500 before:to-cyan-500"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                          render={
                            <Link href={item.href} className="flex items-center gap-2.5 w-full">
                              <Icon
                                size={16}
                                className={cn(
                                  "shrink-0 transition-colors",
                                  active ? "text-primary" : "text-muted-foreground/50"
                                )}
                              />
                              <span className="group-data-[collapsible=icon]:hidden">
                                {item.label}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto h-4 px-1.5 text-[0.6rem] group-data-[collapsible=icon]:hidden"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      {/* ── Footer — user menu ── */}
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              {/*
               * DropdownMenuTrigger renders a <button>.
               * We must NOT put SidebarMenuButton (also a <button>) inside it.
               * Solution: render the trigger as a styled div, keep all button behaviour
               * on the DropdownMenuTrigger itself.
               */}
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <div
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2.5",
                      "transition-colors hover:bg-sidebar-accent outline-none",
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    )}
                  />
                }
              >
                <div className="relative shrink-0">
                  <Avatar className={cn("size-8 ring-2 ring-offset-1 ring-offset-sidebar bg-gradient-to-br", ROLE_GRADIENT[role])}>
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className={cn("text-[0.62rem] font-black text-white bg-gradient-to-br", ROLE_GRADIENT[role])}>
                      {initials(user?.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                </div>
                <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-[0.8rem] font-semibold leading-tight text-sidebar-foreground">
                    {user?.name}
                  </p>
                  <p className={cn(
                    "text-[0.62rem] font-bold uppercase tracking-wide bg-gradient-to-r bg-clip-text text-transparent",
                    ROLE_GRADIENT[role]
                  )}>
                    {ROLE_LABEL[role]}
                  </p>
                </div>
                <ChevronRight size={14} className="ml-auto shrink-0 text-muted-foreground/40 transition-transform group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56 rounded-xl">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-2 py-2">
                    <Avatar className="size-8">
                      <AvatarImage src={user?.image ?? undefined} />
                      <AvatarFallback className={cn("text-[0.62rem] font-black text-white bg-gradient-to-br", ROLE_GRADIENT[role])}>
                        {initials(user?.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => { window.location.href = "/admin/settings"; }}
                >
                  <Settings size={14} /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2"
                  onClick={() => logout()}
                >
                  <LogOut size={14} /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ role }: { role: UserRole }) {
  const pathname   = usePathname();
  const { user }   = useAuthContext();
  const [notifOpen, setNotifOpen] = useState(false);

  const matchedItem = NAV_FLAT[role]
    .filter((item) => isActive(item.href, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const pageTitle  = matchedItem?.label ?? "Overview";
  const ActiveIcon = matchedItem?.icon  ?? LayoutDashboard;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <SidebarTrigger className="-ml-1 size-8 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4" />

      {/* Page title */}
      <div className="flex flex-1 items-center gap-2.5 min-w-0">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ActiveIcon size={13} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-sm leading-tight truncate">{pageTitle}</p>
          <p className="hidden text-[0.62rem] text-muted-foreground sm:block">{ROLE_LABEL[role]} Panel</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Notifications dropdown */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <div
                className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-none"
              />
            }
          >
            <Bell size={16} />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500 shadow shadow-rose-500/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-2xl p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold text-sm">Notifications</span>
              <Badge variant="destructive" className="px-1.5 text-[0.62rem]">3</Badge>
            </div>
            {[
              { title: "New enrollment",  sub: "Priya enrolled in MERN Bootcamp",  time: "2m",  dot: "bg-violet-500"  },
              { title: "Support ticket",  sub: "New ticket from Rohit Verma",      time: "18m", dot: "bg-amber-500"   },
              { title: "Course live",     sub: "DSA with Java is now published",   time: "1h",  dot: "bg-emerald-500" },
            ].map((n, i) => (
              <div key={i} className="flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-accent last:border-0">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.dot)} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8rem] font-semibold leading-tight">{n.title}</p>
                  <p className="truncate text-[0.72rem] text-muted-foreground">{n.sub}</p>
                </div>
                <span className="shrink-0 text-[0.67rem] text-muted-foreground">{n.time} ago</span>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* User chip */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-[0.78rem] font-semibold leading-tight">{user.name?.split(" ")[0]}</p>
              <p className={cn(
                "text-[0.6rem] font-bold uppercase tracking-wide bg-gradient-to-r bg-clip-text text-transparent",
                ROLE_GRADIENT[role]
              )}>
                {ROLE_LABEL[role]}
              </p>
            </div>
            <Avatar className={cn("size-8 ring-2 ring-primary/30 bg-gradient-to-br", ROLE_GRADIENT[role])}>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className={cn("text-[0.62rem] font-black text-white bg-gradient-to-br", ROLE_GRADIENT[role])}>
                {initials(user.name ?? "U")}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
interface DashboardShellProps { children: React.ReactNode; role: UserRole }

export function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar role={role} />
          <SidebarInset className="flex flex-col overflow-hidden">
            <Topbar role={role} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
