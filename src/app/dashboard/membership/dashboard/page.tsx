"use client";

import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarClock,
  Clock,
  Heart,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/features/dashboard/empty-state";
import { motion } from "framer-motion";
import {
  fadeUp,
  fadeUpBounce,
  staggerContainer,
  hoverLiftStrong,
  hoverLift,
  tapPress,
  hoverSpring,
} from "@/components/features/dashboard/membership/animations";
import Heading from "@/components/ui/typography/Heading";
import { Loader } from "@/components/ui/loader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchPastoralDashboard,
  setAlertRead,
  setAlertResolved,
  type PastoralDashboard,
  type PastoralAlert as Alert,
} from "@/services/pastoralService";

// ─────────────────────────────────────────────────────────────────────────────
// Pastoral dashboard - fully server-computed via /members/pastoral/dashboard.
// Classifications use the church's saved settings thresholds.
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_META: Record<
  string,
  { label: string; className: string; icon: typeof Users }
> = {
  inactive: {
    label: "Inactive",
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: Users,
  },
  "at-risk": {
    label: "At Risk",
    className: "bg-red-50 text-red-600 border-red-200",
    icon: AlertCircle,
  },
  "needs-follow-up": {
    label: "Needs Follow-Up",
    className: "bg-amber-50 text-amber-600 border-amber-200",
    icon: TrendingUp,
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between gap-3 min-w-[150px]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("bg-white rounded-2xl border border-gray-200 p-5", className)}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ViewAllLink({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-sm font-semibold text-primary-400 hover:underline shrink-0"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

const ALERT_ICON_BY_CATEGORY: Record<string, typeof Bell> = {
  critical: AlertCircle,
  absences: CalendarClock,
  decline: TrendingDown,
  "first-timers": UserPlus,
  positive: TrendingUp,
  returning: UserPlus,
};

export default function MembershipDashboardPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [data, setData] = useState<PastoralDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = (silent = false) => {
    if (!silent) setIsLoading(true);
    fetchPastoralDashboard()
      .then(setData)
      .catch(() => {
        toast({ title: "Failed to load membership dashboard" });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolve = async (alert: Alert) => {
    setActingOn(alert.alertId);
    try {
      await setAlertResolved(alert.alertId, true);
      toast({ title: `Alert for ${alert.memberName} resolved` });
      load(true);
    } catch {
      toast({ title: "Failed to resolve alert", variant: "destructive" });
    } finally {
      setActingOn(null);
    }
  };

  const handleMarkRead = async (alert: Alert) => {
    if (alert.read) return;
    setActingOn(alert.alertId);
    try {
      await setAlertRead(alert.alertId, true);
      setData((prev) =>
        prev
          ? {
              ...prev,
              recentAlerts: prev.recentAlerts.map((a) =>
                a.alertId === alert.alertId ? { ...a, read: true } : a,
              ),
            }
          : prev,
      );
    } catch {
      toast({ title: "Failed to mark alert as read", variant: "destructive" });
    } finally {
      setActingOn(null);
    }
  };

  const stats = useMemo(() => {
    if (!data) return [];
    const s = data.stats;
    return [
      {
        label: "Total Members",
        value: s.totalMembers,
        icon: Users,
        iconClass: "bg-blue-50 text-primary-400 border-blue-100",
      },
      {
        label: "Need Attention",
        value: s.needAttention,
        icon: AlertCircle,
        iconClass: "bg-amber-50 text-amber-500 border-amber-100",
      },
      {
        label: "Highly Engaged",
        value: s.highlyEngaged,
        icon: TrendingUp,
        iconClass: "bg-green-50 text-green-600 border-green-100",
      },
      {
        label: "First-Time Guests",
        value: s.firstTimeGuests,
        icon: UserPlus,
        iconClass: "bg-purple-50 text-purple-500 border-purple-100",
      },
      {
        label: "At Risk",
        value: s.atRisk,
        icon: Heart,
        iconClass: "bg-red-50 text-red-500 border-red-100",
      },
      {
        label: "Pending Follow-Ups",
        value: s.pendingFollowUps,
        icon: Clock,
        iconClass: "bg-gray-100 text-gray-500 border-gray-200",
      },
    ];
  }, [data]);

  const engagementSlices = useMemo(() => {
    if (!data) return [];
    const e = data.engagement;
    return [
      { name: "Active", value: e.active, color: "#2563EB", dot: "bg-blue-600" },
      { name: "Growing", value: e.growing, color: "#F97316", dot: "bg-orange-500" },
      {
        name: "Needs Follow-Up",
        value: e.needsFollowUp,
        color: "#EAB308",
        dot: "bg-yellow-500",
      },
      { name: "At Risk", value: e.atRisk, color: "#EF4444", dot: "bg-red-500" },
      { name: "Inactive", value: e.inactive, color: "#9CA3AF", dot: "bg-gray-400" },
    ];
  }, [data]);

  const engagementTotal = engagementSlices.reduce((sum, s) => sum + s.value, 0);
  const activePercent =
    engagementTotal > 0
      ? ((engagementSlices[0].value / engagementTotal) * 100).toFixed(1)
      : "0.0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="h-14 px-4 sm:px-6 flex items-center gap-3">
            <Heading level={3} className="leading-none m-0">
              Pastoral Dashboard
            </Heading>
          </div>
        </header>
        <div className="flex items-center justify-center py-32">
          <Loader size="w-10 h-10" showShadow={false} />
        </div>
      </div>
    );
  }

  const hasMembers = (data?.stats.totalMembers ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* ── Page title ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 flex items-center gap-2">
          <Heading level={3} className="leading-none m-0">
            Pastoral Dashboard
          </Heading>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-4 flex flex-col gap-5">
        {/* Stat cards - staggered entrance on load */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUpBounce}
              whileHover={hoverLiftStrong}
              whileTap={tapPress}
              transition={hoverSpring}
              className="cursor-default"
            >
              <StatCard
                label={s.label}
                value={s.value}
                icon={s.icon}
                iconClass={s.iconClass}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Attention + Alerts - sections fade-rise in sequence */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <SectionCard
            title="Members Needing Attention"
            action={<ViewAllLink href="/dashboard/membership/attention-center" />}
          >
            {!data || data.attention.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No members need attention"
                description="Members with repeated absences will show up here so you can step in early."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {data.attention.map((member, idx) => {
                  const meta = LEVEL_META[member.level];
                  const LevelIcon = meta.icon;
                  return (
                    <motion.div
                      key={member.memberId}
                      variants={fadeUpBounce}
                      custom={idx}
                      whileHover={{ x: 3 }}
                      transition={hoverSpring}
                      className="flex items-center justify-between gap-3 py-3.5 rounded-lg px-2 -mx-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                          {member.initials || "M"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {member.absences} consecutive absence
                            {member.absences === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium shrink-0",
                          meta.className,
                        )}
                      >
                        <LevelIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Recent Alerts"
            action={<ViewAllLink href="/dashboard/membership/attention-center" />}
          >
            {!data || data.recentAlerts.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No recent alerts"
                description="Alerts appear when a member's attendance pattern needs care."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recentAlerts.map((alert) => {
                  const AlertIcon =
                    ALERT_ICON_BY_CATEGORY[alert.category] ?? Bell;
                  const iconClass =
                    alert.severity === "urgent"
                      ? "bg-red-50 text-red-500"
                      : alert.severity === "high"
                        ? "bg-orange-50 text-orange-500"
                        : alert.severity === "medium"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-blue-50 text-blue-500";
                  const dotClass =
                    alert.severity === "urgent"
                      ? "bg-red-500"
                      : alert.severity === "high"
                        ? "bg-orange-500"
                        : alert.severity === "medium"
                          ? "bg-amber-500"
                          : "bg-primary-400";

                  return (
                    <motion.div
                      key={alert.alertId}
                      whileHover={{ x: 3 }}
                      transition={hoverSpring}
                      className="flex gap-3 py-3.5 rounded-lg px-2 -mx-2 hover:bg-gray-50"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          iconClass,
                        )}
                      >
                        <AlertIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              dotClass,
                            )}
                          />
                          {alert.memberName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button
                            onClick={() => handleMarkRead(alert)}
                            disabled={alert.read || actingOn === alert.alertId}
                            className={cn(
                              "text-xs font-medium",
                              alert.read
                                ? "text-gray-300 cursor-default"
                                : "text-primary-400 hover:underline",
                            )}
                          >
                            {alert.read ? "Read" : "Mark Read"}
                          </button>
                          <button
                            onClick={() => handleResolve(alert)}
                            disabled={actingOn === alert.alertId}
                            className="text-xs font-medium text-green-600 hover:underline"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Trend + Engagement */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <SectionCard
            title="Attendance Trend"
            subtitle="Weekly service attendance over the last 6 weeks"
          >
            {!hasMembers ? (
              <EmptyState
                icon={CalendarClock}
                title="No attendance data yet"
                description="Weekly attendance will chart here once services are recorded."
                className="py-14"
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data?.trend ?? []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="attendanceFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563EB"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563EB"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name === "attendance" ? "Attendance" : "First Timers",
                      ]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      name="attendance"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fill="url(#attendanceFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="firstTimers"
                      name="firstTimers"
                      stroke="#F97316"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Engagement Breakdown"
            subtitle="Current distribution of member engagement"
          >
            {!hasMembers || engagementTotal === 0 ? (
              <EmptyState
                icon={Users}
                title="No engagement data yet"
                description="The engagement mix will appear as members and attendance are recorded."
                className="py-14"
              />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative h-52 w-52 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementSlices}
                        dataKey="value"
                        innerRadius="64%"
                        outerRadius="94%"
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {engagementSlices.map((slice) => (
                          <Cell key={slice.name} fill={slice.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-900">
                      {activePercent}%
                    </span>
                    <span className="text-xs text-gray-400">Active</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  {engagementSlices.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn("w-2.5 h-2.5 rounded-full", item.dot)}
                        />
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {((item.value / engagementTotal) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Highly Engaged - top members link out to the full members list */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <SectionCard
          title="Highly Engaged"
          action={
            <ViewAllLink href="/dashboard/membership/members" label="All Members" />
          }
        >
          {(data?.stats.highlyEngaged ?? 0) === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No highly engaged members yet"
              description="Members with 80%+ attendance will be recognised here as records build up."
            />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50/60 border border-green-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {data?.stats.highlyEngaged} member
                  {data?.stats.highlyEngaged === 1 ? "" : "s"} with 80%+
                  attendance
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your most committed members - consider them for leadership and
                  volunteering opportunities.
                </p>
              </div>
            </div>
          )}
        </SectionCard>
        </motion.div>
      </div>
    </div>
  );
}
