import { ActivityRow, DepartmentRow } from "@/types";
import {
  Activity,
  Calendar1,
  CalendarCheck2,
  ChartPie,
  CheckCircle,
  DollarSign,
  FileText,
  Gift,
  Inbox,
  Layers,
  LogOut,
  MessagesSquare,
  NotepadTextDashed,
  Settings,
  Tag,
  UserPlus,
  Wallet,
} from "lucide-react";

export const SidebarData = {
  pages: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: ChartPie,
    },
    {
      title: "Membership",
      url: "/dashboard/membership",
      icon: Inbox,
    },
    {
      title: "Attendance",
      url: "/dashboard/attendance",
      icon: CalendarCheck2,
    },
    {
      title: "Departments/Units",
      url: "/dashboard/departments",
      icon: Layers,
    },
    {
      title: "Events & Reminders",
      url: "/dashboard/events",
      icon: Calendar1,
    },
    {
      title: "Communications",
      url: "/dashboard/communications",
      icon: MessagesSquare,
    },
    {
      title: "Requisitions",
      url: "/dashboard/requisitions",
      icon: NotepadTextDashed,
    },
    {
      title: "Finance",
      url: "/dashboard/finance",
      icon: Wallet,
    },
  ],
  footer: [
    {
      title: "Settings/Admin",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Activity Log",
      url: "/dashboard/activity-log",
      icon: Activity,
    },
    {
      title: "Logout",
      url: "/auth/login",
      icon: LogOut,
    }
  ],
}

export const DashboardData = {
  stats: {
    totalMembers: "30,350",
    serviceAttendance: "3,671",
    totalIncome: "2,318",
    totalMembersGrowth: "+10%",
    attendanceGrowth: "-10.5%",
    incomeGrowth: "+15%",
  },
  attendanceData: [
    { month: "Jan", thisMonth: 11598, lastMonth: 9000 },
    { month: "Feb", thisMonth: 12000, lastMonth: 10000 },
    { month: "Mar", thisMonth: 15000, lastMonth: 11000 },
    { month: "Apr", thisMonth: 21000, lastMonth: 17000 },
    { month: "May", thisMonth: 26000, lastMonth: 22000 },
    { month: "Jun", thisMonth: 23000, lastMonth: 20000 },
    { month: "Jul", thisMonth: 25000, lastMonth: 21000 },
  ],
  incomeExpenses: [
    { month: "Jan", income: 800, expenses: 400 },
    { month: "Feb", income: 1200, expenses: 600 },
    { month: "Mar", income: 1400, expenses: 700 },
    { month: "Apr", income: 1100, expenses: 500 },
    { month: "May", income: 1500, expenses: 800 },
    { month: "Jun", income: 1300, expenses: 700 },
  ],
  incomeBreakdown: [
    { name: "Tithes", value: 52.1, color: "#2563EB" },
    { name: "Offering", value: 22.8, color: "#F97316" },
    { name: "Seeds", value: 13.9, color: "#10B981" },
    { name: "Donations", value: 11.2, color: "#EF4444" },
  ],
  upcomingEvents: [
    { title: "Sunday Service", when: "Tomorrow" },
    { title: "Leaders Meeting", when: "Tomorrow" },
    { title: "Morning Devotion", when: "Monday" },
    { title: "Bible Study", when: "Monday" },
    { title: "Prayer Meeting", when: "Thursday" },
  ],
  birthdays: [
    { name: "Pastor John", when: "Tomorrow" },
    { name: "John Doe", when: "Thursday" },
    { name: "Pastor Peter", when: "Saturday" },
  ],
}

export const NotificationData = [
  {
    icon: CheckCircle,
    title: "Requisition Approved by HOD",
    description: "Sound system upgrade request was approved",
    date: "Just Now",
    isRead: false,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  {
    icon: FileText,
    title: "Offering Report Ready - March 2025",
    description: "Total ₦380,000 collected across 3 branches",
    date: "30 mins ago",
    isRead: false,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: DollarSign,
    title: "Salary Payment Successful",
    description: "Salaries for 6 staff members completed",
    date: "1 hour ago",
    isRead: false,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    icon: UserPlus,
    title: "New Member Registered",
    description: "Gloria Samuel added to Youth Church",
    date: "8 hours ago",
    isRead: false,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    icon: Gift,
    title: "Upcoming Birthday: Ade Samuel",
    description: "Birthday is tomorrow - May 16",
    date: "1 day ago",
    isRead: false,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    icon: Tag,
    title: "Subscription Expiring in 3 Days",
    description: "Current plan will expire on May 18",
    date: "30 days ago",
    isRead: false,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
  },
];

export const ActivityLogData: ActivityRow[] = [
  {
    id: "1",
    timestamp: "2025-05-15T10:34:00",
    user: { name: "John Doe", initials: "JD" },
    action: "Submitted a requisition",
    module: "Requisition",
    details: "For media projector (₦150,000)",
  },
  {
    id: "2",
    timestamp: "2025-05-14T19:15:00",
    user: { name: "Admin", initials: "AD" },
    action: "Approved requisition",
    module: "Requisition",
    details: "For generator diesel",
  },
  {
    id: "3",
    timestamp: "2025-05-14T17:42:00",
    user: { name: "Gloria A.", initials: "GA" },
    action: "Added new church member",
    module: "Membership",
    details: "Member: Peter Samuel",
  },
  {
    id: "4",
    timestamp: "2025-05-13T14:05:00",
    user: { name: "Ruth B.", initials: "RB" },
    action: "Logged in",
    module: "Authentication",
    details: "IP: 102.67.34.98",
  },
  {
    id: "5",
    timestamp: "2025-05-14T17:42:00",
    user: { name: "David O.", initials: "DO" },
    action: "Sent out event reminders",
    module: "Events",
    details: "For Sunday Thanksgiving Service",
  },
];

export const departmentData: DepartmentRow[] = [
  { id: "1", name: "Media Team", hod: { name: "John Doe", initials: "JD" }, members: 6, status: "Active" },
  { id: "2", name: "Ushering", hod: { name: "Sister Mary", initials: "SM" }, members: 10, status: "Active" },
  { id: "3", name: "Choir", hod: { name: "Mr. Caleb", initials: "MC" }, members: 19, status: "Active" },
  { id: "4", name: "Evangelism", hod: { name: "Pastor", initials: "P" }, members: 15, status: "Active" },
];

export const departmentMembers = [
  { id: "m1", name: "Jane Smith", role: "Assistant HOD", joined: "Jan 2023", contact: "+234 801 234 5678" },
  { id: "m2", name: "Michael James", role: "Camera Operator", joined: "Feb 2024", contact: "+234 801 234 5678" },
  { id: "m3", name: "Deborah Ajayi", role: "Sound Tech", joined: "March 2022", contact: "+234 801 234 5678" },
];

export const departmentEvents = [
  { id: "e1", event: "Sunday Worship", date: "May 26, 2025", status: "Completed", assigned: "Yes" },
  { id: "e2", event: "Leadership Retreat", date: "June 10, 2025", status: "Completed", assigned: "Yes" },
  { id: "e3", event: "Community Service", date: "July 15, 2025", status: "Upcoming", assigned: "No" },
];

export const departmentRequisitions = [
  { id: "rq1", date: "May 12", title: "New Microphones", amount: "₦80,000", status: "Pending" },
  { id: "rq2", date: "Apr 10", title: "Mixer Replacement", amount: "₦120,000", status: "Approved" },
  { id: "rq3", date: "March 14", title: "HDMI Cables Replacement", amount: "₦60,000", status: "Approved" },
];
