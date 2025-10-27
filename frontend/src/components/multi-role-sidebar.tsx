"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings, 
  FileText,
  Database,
  Heart,
  Baby,
  Calendar,
  Megaphone,
  BarChart3,
  ClipboardList,
  Syringe,
  BookOpen,
  TrendingUp,
  GraduationCap,
  PartyPopper,
  UserCheck,
  FileSpreadsheet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { TeamSwitcher } from "@/components/team-switcher"

const getMultiRoleNavigation = (userRoles: string[], hasPatientRecord: boolean = false) => {
  const hasRole = (role: string) => userRoles.includes(role);
  const navigation = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    main: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quickActions: [] as any[]
  };

  // Always add dashboard
  navigation.main.push({
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  });

  // Admin Access (System Admin & Barangay Captain) - check both roles array and single role
  const isSystemAdmin = hasRole('SYSTEM_ADMIN');
  const isBarangayCaptain = hasRole('BARANGAY_CAPTAIN');
  const isAdmin = isSystemAdmin || isBarangayCaptain;
  const isSingleRoleAdmin = userRoles.includes('SYSTEM_ADMIN') || userRoles.includes('BARANGAY_CAPTAIN');
  
  if (isAdmin || isSingleRoleAdmin) {
    navigation.main.push(
      {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
        items: [
          { title: "All Users", url: "/admin/users" },
          { title: "Pending Approvals", url: "/admin/users/pending" },
          ...(isSystemAdmin ? [{ title: "Role Management", url: "/admin/users/roles" }] : []),
        ],
      },
      {
        title: "Reports & Analytics",
        url: "/reports",
        icon: BarChart3,
        items: [
          { title: "Dashboard", url: "/reports" },
          { title: "Health Reports", url: "/reports/health" },
          { title: "Daycare Reports", url: "/reports/daycare" },
          { title: "SK Reports", url: "/reports/sk" },
          { title: "Cross-Module Analytics", url: "/reports/analytics" },
        ],
      },
      {
        title: "Announcements",
        url: "/admin/announcements",
        icon: Megaphone,
      },
      {
        title: "System Settings",
        url: "/admin/settings",
        icon: Settings,
        items: [
          { title: "General Settings", url: "/admin/settings" },
          ...(isSystemAdmin ? [
            { title: "Backup Management", url: "/admin/settings/backup" },
            { title: "Audit Logs", url: "/admin/settings/audit-logs" }
          ] : []),
          { title: "Notifications", url: "/admin/settings/notifications" },
        ],
      }
    );
    navigation.quickActions.push(
      { name: "Approve User", url: "/admin/users/pending", icon: UserCheck },
      { name: "View Reports", url: "/reports", icon: FileSpreadsheet },
      ...(isSystemAdmin ? [{ name: "System Backup", url: "/admin/settings/backup", icon: Database }] : [])
    );
  }

  // Health Services (BHW & BHW Coordinator)
  if (hasRole('BHW') || hasRole('BHW_COORDINATOR')) {
    const isCoordinator = hasRole('BHW_COORDINATOR');
    
    navigation.main.push({
      title: "Health Services",
      url: "/health",
      icon: Heart,
      items: [
        { title: "Dashboard", url: "/health" },
        { title: "Patient Management", url: "/health/patients" },
        { title: "Appointments", url: "/health/appointments" },
        { title: "Immunization Cards", url: "/health/records" },
        { title: "Certificates", url: "/health/certificates" },
      ],
    });

    if (isCoordinator) {
      navigation.main.push({
        title: "Health Reports",
        url: "/reports/health",
        icon: FileText,
        items: [
          { title: "Health Reports", url: "/reports/health" },
          { title: "Statistics", url: "/reports/health/stats" },
        ],
      });
    }

    navigation.quickActions.push(
      { name: "Add Patient", url: "/health/patients", icon: Users },
      { name: "Schedule Appointment", url: "/health/appointments", icon: Calendar },
      { name: "Record Immunization", url: "/health/records", icon: Syringe }
    );
  }

  // Daycare Services (Daycare Staff & Teacher)
  if (hasRole('DAYCARE_STAFF') || hasRole('DAYCARE_TEACHER')) {
    navigation.main.push({
      title: "Daycare Management",
      url: "/daycare",
      icon: Baby,
      items: [
        { title: "Dashboard", url: "/daycare" },
        { title: "Registrations", url: "/daycare/registrations" },
        { title: "Attendance", url: "/daycare/attendance" },
        { title: "Progress Reports", url: "/daycare/progress-reports" },
        { title: "Learning Materials", url: "/daycare/materials" },
      ],
    });

    navigation.quickActions.push(
      { name: "Mark Attendance", url: "/daycare/attendance", icon: ClipboardList },
      { name: "Upload Materials", url: "/daycare/materials", icon: BookOpen },
      { name: "Progress Report", url: "/daycare/progress-reports", icon: GraduationCap }
    );
  }

  // SK Services (SK Officer & Chairman)
  if (hasRole('SK_OFFICER') || hasRole('SK_CHAIRMAN')) {
    const isChairman = hasRole('SK_CHAIRMAN');

    navigation.main.push({
      title: "SK Engagement",
      url: "/sk",
      icon: PartyPopper,
      items: [
        { title: "Dashboard", url: "/sk" },
        { title: "Event Management", url: "/sk/events" },
        { title: "Event Registration", url: "/sk/event-registration" },
        { title: "Attendance Tracking", url: "/sk/attendance" },
      ],
    });

    if (isChairman) {
      navigation.main.push({
        title: "SK Analytics",
        url: "/sk/analytics",
        icon: TrendingUp,
        items: [
          { title: "Participation Analytics", url: "/sk/analytics" },
          { title: "Reports", url: "/reports/sk" },
        ],
      });
    }

    navigation.quickActions.push(
      { name: "Create Event", url: "/sk/events", icon: Calendar },
      { name: "Track Attendance", url: "/sk/attendance", icon: UserCheck }
    );
  }

  // Parent/Resident Services
  if (hasRole('PARENT_RESIDENT')) {
    navigation.main.push(
      {
        title: "My Health Records",
        url: "/health/my-records",
        icon: Heart,
        items: [
          { title: "Immunization Records", url: "/health/my-records" },
        ],
      },
      {
        title: "Daycare Services",
        url: "/daycare",
        icon: Baby,
        items: [
          { title: "Child Registration", url: "/daycare/registration" },
          { title: "My Children's Progress", url: "/daycare/progress" },
          { title: "Educational Resources", url: "/daycare/resources" },
        ],
      },
      {
        title: "Events",
        url: "/events",
        icon: Calendar,
        items: [
          { title: "Browse Events", url: "/events/public" },
          { title: "My Registrations", url: "/events/my-registrations" },
        ],
      }
    );

    navigation.quickActions.push(
      { name: "Register Child", url: "/daycare/registration", icon: Baby },
      { name: "View Progress", url: "/daycare/progress", icon: GraduationCap },
      { name: "Browse Events", url: "/events/public", icon: Calendar }
    );
  }

  // Patient Services (if user has patient record)
  if (hasPatientRecord) {
    navigation.main.push({
      title: "My Health",
      url: "/health",
      icon: Heart,
      items: [
        { title: "My Appointments", url: "/health/appointments" },
        { title: "Immunization Cards", url: "/health/records" },
        { title: "Immunization E-Card", url: "/health/certificates" },
      ],
    });

    navigation.quickActions.push(
      { name: "View Appointments", url: "/health/appointments", icon: Calendar },
      { name: "Immunization Cards", url: "/health/records", icon: FileText }
    );
  }

  // Public Services (always available - skip announcements for admins since they have manage announcements)
  if (!isAdmin && !isSingleRoleAdmin) {
    navigation.main.push(
      {
        title: "Announcements",
        url: "/announcements",
        icon: Megaphone,
      }
    );
  }

  // Deduplicate main navigation items by title, merging subitems if they exist
  const mainMap = new Map();
  navigation.main.forEach(item => {
    if (mainMap.has(item.title)) {
      const existing = mainMap.get(item.title);
      if (item.items && existing.items) {
        // Merge subitems, deduplicating by title
        const itemMap = new Map();
        // @ts-expect-error: items is any[] but we know it has title
        existing.items.forEach(sub => itemMap.set(sub.title, sub));
        // @ts-expect-error: items is any[] but we know it has title
        item.items.forEach(sub => itemMap.set(sub.title, sub));
        existing.items = Array.from(itemMap.values());
      }
    } else {
      mainMap.set(item.title, item);
    }
  });
  navigation.main = Array.from(mainMap.values());

  // Deduplicate quick actions by name
  const quickMap = new Map();
  navigation.quickActions.forEach(action => {
    quickMap.set(action.name, action);
  });
  navigation.quickActions = Array.from(quickMap.values());

  return navigation;
};

export function MultiRoleSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {
    name: "Guest",
    email: "guest@theycare.com",
    roles: ["VISITOR"],
    firstName: "Guest",
    lastName: "User"
  };

  // Get multi-role navigation
  const userRoles = user.roles || [user.role || "VISITOR"];
  const hasPatientRecord = user.hasPatientRecord || false;
  const navigation = getMultiRoleNavigation(userRoles, hasPatientRecord);

  const userData = {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Guest User',
    email: user.email || 'guest@theycare.com',
    avatar: user.avatar || `/avatars/${user.email}.png`,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[{
            name: "Gabay Barangay",
            logo: () => <img src="/theycare.png" alt="Gabay Barangay" className="h-8 w-8 object-contain" style={{ aspectRatio: '1/1' }} />,
            plan: "Community"
          }]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.main} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}