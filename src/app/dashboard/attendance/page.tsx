"use client";

import { endOfMonth, format, startOfMonth } from "date-fns";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AttendanceEmptyState } from "@/components/features/dashboard/attendance/attendance-empty-state";
import { AttendanceModal } from "@/components/features/dashboard/attendance/attendance-modal";
import { CalendarGrid } from "@/components/features/dashboard/attendance/calendar-grid";
import {
  CreateRegularServiceModal,
  PendingRegularService,
} from "@/components/features/dashboard/attendance/create-regular-service";
import { CreateSpecialServiceModal } from "@/components/features/dashboard/attendance/create-special-service";
import {
  GivingRecordModal,
  GivingValues,
} from "@/components/features/dashboard/attendance/giving-record-modal";
import { MobileAttendanceView } from "@/components/features/dashboard/attendance/mobile-view";
import { ServiceDetailModal } from "@/components/features/dashboard/attendance/service-detail-modal";
import { ServiceTypeModal } from "@/components/features/dashboard/attendance/service-type";
import { SpecialAttendanceModal } from "@/components/features/dashboard/attendance/special-attendance-modal";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAllServices,
  fetchServices,
  mapToRegularService,
  mapToSpecialService,
} from "@/lib/api";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { DEFAULT_ORDER } from "@/lib/data";
import { ServiceFrequency, ServiceType } from "@/lib/enums";
import { createChurchService, DAY } from "@/services/churchService";
import {
  fetchGivingRecords,
  saveGivingRecord,
} from "@/services/givingRecordService";
import { RegularService, SpecialServiceEvent } from "@/types";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export default function AttendancePage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const userProfile = getCurrentUserProfile();
  const Admin = userProfile?.fullName || "Unknown";
  const [regularServices, setRegularServices] = useState<RegularService[]>([]);
  const [specialServices, setSpecialServices] = useState<SpecialServiceEvent[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isRegularModalOpen, setIsRegularModalOpen] = useState(false);
  const [isSpecialModalOpen, setIsSpecialModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isGivingRecordModalOpen, setIsGivingRecordModalOpen] = useState(false);
  const [isServiceDetailModalOpen, setIsServiceDetailModalOpen] =
    useState(false);
  const [selectedService, setSelectedService] = useState<RegularService | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [givingRecords, setGivingRecords] = useState<
    Record<string, GivingValues>
  >({});
  const [orderByServiceDate, setOrderByServiceDate] = useState<
    Record<string, string[]>
  >({});
  const [isSpecialAttendanceModalOpen, setIsSpecialAttendanceModalOpen] =
    useState(false);
  const [selectedSpecialService, setSelectedSpecialService] =
    useState<SpecialServiceEvent | null>(null);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllServices(format(new Date(), "yyyy-MM"));

      // Separate regular and special services
      const regular = data
        .filter((service) => service.type === "REGULAR")
        .map(mapToRegularService);

      const special = data
        .filter((service) => service.type === "SPECIAL")
        .map(mapToSpecialService);

      setRegularServices(regular);
      setSpecialServices(special);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk-prefetch the current month's giving records so calendar entries
  // show real totals immediately instead of only after each one is opened.
  const loadGivingRecordsForMonth = async () => {
    try {
      const now = new Date();
      const { data } = await fetchGivingRecords({
        startDate: format(startOfMonth(now), "yyyy-MM-dd"),
        endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        limit: 100,
      });

      setGivingRecords((prev) => {
        const next = { ...prev };
        for (const record of data) {
          next[getServiceDateKey(record.churchServiceId, record.date)] = {
            tithe: String(record.tithe || ""),
            offering: String(record.offering || ""),
            specialOffering: String(record.specialOffering || ""),
            thanksgivingOffering: String(record.thanksgivingOffering || ""),
          };
        }
        return next;
      });
    } catch {
      // Non-fatal - calendar just shows "Add giving record" until opened.
    }
  };

  useEffect(() => {
    loadServices();
    loadGivingRecordsForMonth();
  }, []);

  const handleCreateServices = async (newServices: PendingRegularService[]) => {
    try {
      for (const service of newServices) {
        await createChurchService({
          title: service.title,
          type: "REGULAR",
          day: service.day as DAY,
          startTime: service.startTime,
          endTime: service.endTime,
          location: service.location,
          recurrence:
            service.frequency === "weekly"
              ? "WEEKLY_MONDAY"
              : "MONTHLY_FIRST_MONDAY",
          eventType: "WORSHIP_SERVICE",
          reminderEnabled: false,
        });
      }

      await loadServices();

      toast({
        title: "Success",
        description: `${newServices.length} service(s) created successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create services",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setServiceContext = (service: RegularService, date: string) => {
    setSelectedService(service);
    setSelectedDate(date);
  };

  const getServiceDateKey = (serviceId: string, date: string) =>
    `${serviceId}|${date}`;

  const parseAmount = (value: string) => {
    const normalized = value.replace(/,/g, "").trim();
    const amount = Number(normalized);
    return Number.isNaN(amount) ? 0 : amount;
  };

  const givingTotals = useMemo(() => {
    return Object.entries(givingRecords).reduce<Record<string, number>>(
      (acc, [key, values]) => {
        const total =
          parseAmount(values.tithe) +
          parseAmount(values.offering) +
          parseAmount(values.specialOffering) +
          parseAmount(values.thanksgivingOffering);
        acc[key] = total;
        return acc;
      },
      {},
    );
  }, [givingRecords]);

  const selectedKey =
    selectedService && selectedDate
      ? getServiceDateKey(selectedService.id, selectedDate)
      : null;

  const isFutureService = useMemo(() => {
    if (!selectedService || !selectedDate) return false;
    const now = new Date();
    const serviceDate = new Date(selectedDate);
    serviceDate.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (serviceDate.getTime() > today.getTime()) return true;
    if (serviceDate.getTime() < today.getTime()) return false;

    const start = selectedService.startTime.toLowerCase().trim();
    const timeMatch = start.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!timeMatch) return false;

    let hour = Number(timeMatch[1]);
    const suffix = timeMatch[3];
    if (suffix === "pm" && hour < 12) hour += 12;
    if (suffix === "am" && hour === 12) hour = 0;

    const minute = Number(timeMatch[2] || 0);
    return (
      now.getHours() < hour ||
      (now.getHours() === hour && now.getMinutes() < minute)
    );
  }, [selectedService, selectedDate]);

  const handleCreateServiceClick = () => {
    setIsTypeModalOpen(true);
  };

  const handleSelectServiceType = (
    type: ServiceType.REGULAR | ServiceType.SPECIAL,
  ) => {
    if (type === ServiceType.REGULAR) {
      setIsRegularModalOpen(true);
    } else {
      setIsSpecialModalOpen(true);
    }
  };

  const handleAddService = () => {
    setIsTypeModalOpen(true);
  };

  const handleCreateSpecialService = async (service: SpecialServiceEvent) => {
    try {
      await createChurchService({
        title: service.title,
        type: "SPECIAL",
        startDate: service.startDate,
        endDate: service.endDate || service.startDate,
        location: service.location,
        recurrence: service.recurrence || "NO_REPEAT",
        specialDays:
          service.daySchedules?.map((schedule) => ({
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime || undefined,
          })) || [],
        description: service.description,
        eventType: service.eventType || "WORSHIP_SERVICE",
        reminderEnabled: false,
      });
      await loadServices();

      toast({
        title: "Success",
        description: "Special service created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create special service",
        variant: "destructive",
      });
      throw error; // Re-throw to let modal know it failed
    }
  };

  const handleAddAttendance = (service: RegularService, date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      toast({
        title: "Cannot Mark Attendance",
        description: `You cannot mark attendance for future dates (${format(selectedDate, "MMMM d, yyyy")}). Attendance can only be recorded for past or current dates.`,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      });
      return;
    }

    setServiceContext(service, date);
    setIsAttendanceModalOpen(true);
  };

  const handleAddSpecialAttendance = (
    service: SpecialServiceEvent,
    date: string,
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      toast({
        title: "Cannot Mark Attendance",
        description: `You cannot mark attendance for future dates (${format(selectedDate, "MMMM d, yyyy")}). Attendance can only be recorded for past or current dates.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setSelectedSpecialService(service);
    setSelectedDate(date);
    setIsSpecialAttendanceModalOpen(true);
  };

  // Handler for saving special attendance - mirrors the regular one
  const handleSpecialAttendanceSaved = (payload: {
    serviceId: string;
    date: string;
    presentMembers: string[];
    absentMembers: string[];
  }) => {
    setSpecialServices((prev) =>
      prev.map((service) => {
        if (service.id !== payload.serviceId) return service;
        const attendanceRecords = [...(service.attendanceRecords || [])];
        const schedule = service.daySchedules?.find(
          (s) => s.date === payload.date,
        );
        const nextRecord = {
          serviceId: payload.serviceId,
          date: payload.date,
          presentMembers: payload.presentMembers,
          absentMembers: payload.absentMembers,
          recordedBy: Admin,
          location: service.location || "",
          startTime: schedule?.startTime || "",
          endTime: schedule?.endTime || "",
        };
        const existingIndex = attendanceRecords.findIndex(
          (record) => record.date === payload.date,
        );
        if (existingIndex >= 0) attendanceRecords[existingIndex] = nextRecord;
        else attendanceRecords.push(nextRecord);

        return {
          ...service,
          attendanceRecords,
        };
      }),
    );
    toast({
      title: "Success",
      description: "Special service attendance saved successfully",
    });
  };

  const handleAddGivingRecord = async (
    service: RegularService,
    date: string,
  ) => {
    setServiceContext(service, date);
    setIsGivingRecordModalOpen(true);

    const key = getServiceDateKey(service.id, date);
    if (givingRecords[key]) {
      return;
    }

    try {
      const { data } = await fetchGivingRecords({
        churchServiceId: service.id,
        startDate: date,
        endDate: date,
        limit: 1,
      });
      const existing = data[0];
      if (existing) {
        setGivingRecords((prev) => ({
          ...prev,
          [key]: {
            tithe: String(existing.tithe || ""),
            offering: String(existing.offering || ""),
            specialOffering: String(existing.specialOffering || ""),
            thanksgivingOffering: String(existing.thanksgivingOffering || ""),
          },
        }));
      }
    } catch {
      // No existing record yet, or fetch failed - modal just opens blank.
    }
  };

  const handleSaveGivingRecord = async (values: GivingValues) => {
    if (!selectedService || !selectedDate) {
      return;
    }
    try {
      await saveGivingRecord({
        churchServiceId: selectedService.id,
        date: selectedDate,
        tithe: parseAmount(values.tithe),
        offering: parseAmount(values.offering),
        specialOffering: parseAmount(values.specialOffering),
        thanksgivingOffering: parseAmount(values.thanksgivingOffering),
      });

      setGivingRecords((prev) => ({
        ...prev,
        [getServiceDateKey(selectedService.id, selectedDate)]: values,
      }));

      toast({
        title: "Success",
        description: "Giving record saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save giving record",
        variant: "destructive",
      });
    }
  };

  const handleViewServiceDetails = (service: RegularService, date: string) => {
    setServiceContext(service, date);
    setIsServiceDetailModalOpen(true);
  };

  const handleAttendanceSaved = (payload: {
    serviceId: string;
    date: string;
    presentMembers: string[];
    absentMembers: string[];
  }) => {
    setRegularServices((prev) =>
      prev.map((service) => {
        if (service.id !== payload.serviceId) return service;
        const attendanceRecords = [...(service.attendanceRecords || [])];
        const nextRecord = {
          serviceId: payload.serviceId,
          date: payload.date,
          presentMembers: payload.presentMembers,
          absentMembers: payload.absentMembers,
          recordedBy: Admin,
          location: service.location || "",
          startTime: service.startTime,
          endTime: service.endTime,
        };
        const existingIndex = attendanceRecords.findIndex(
          (record) => record.date === payload.date,
        );
        if (existingIndex >= 0) attendanceRecords[existingIndex] = nextRecord;
        else attendanceRecords.push(nextRecord);

        return {
          ...service,
          attendanceRecords,
        };
      }),
    );
    toast({
      title: "Success",
      description: "Attendance saved successfully",
    });
  };

  // Combine all services for the hasServices check
  const allServices = [...regularServices, ...specialServices];
  const hasServices = allServices.length > 0;

  if (isMobile) {
    return (
      <>
        <MobileAttendanceView
          regularServices={regularServices}
          specialServices={specialServices}
          onAddAttendance={handleAddAttendance}
          onAddGivingRecord={handleAddGivingRecord}
          onViewServiceDetails={handleViewServiceDetails}
          onAddSpecialAttendance={handleAddSpecialAttendance}
          onAddService={handleAddService}
          onSelectRegularService={() => {
            setIsTypeModalOpen(false);
            setIsRegularModalOpen(true);
          }}
          onSelectSpecialService={() => {
            setIsTypeModalOpen(false);
            setIsSpecialModalOpen(true);
          }}
        />

        <CreateRegularServiceModal
          open={isRegularModalOpen}
          onOpenChange={setIsRegularModalOpen}
          onCreateServices={handleCreateServices}
        />

        <CreateSpecialServiceModal
          open={isSpecialModalOpen}
          onOpenChange={setIsSpecialModalOpen}
          onCreateService={handleCreateSpecialService}
        />

        <ServiceTypeModal
          open={isTypeModalOpen}
          onOpenChange={setIsTypeModalOpen}
          onSelectType={handleSelectServiceType}
        />

        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          service={selectedService}
          date={selectedDate}
          onSave={handleAttendanceSaved}
        />

        <GivingRecordModal
          open={isGivingRecordModalOpen}
          onOpenChange={setIsGivingRecordModalOpen}
          service={selectedService}
          date={selectedDate}
          initialValues={selectedKey ? givingRecords[selectedKey] : undefined}
          onSave={handleSaveGivingRecord}
        />

        <ServiceDetailModal
          open={isServiceDetailModalOpen}
          onOpenChange={setIsServiceDetailModalOpen}
          service={selectedService}
          date={selectedDate}
          orderItems={
            selectedKey
              ? orderByServiceDate[selectedKey] || DEFAULT_ORDER
              : DEFAULT_ORDER
          }
          canEditOrder={Boolean(
            selectedService?.frequency === ServiceFrequency.WEEKLY &&
            isFutureService,
          )}
          onSaveOrder={(items) => {
            if (!selectedService || !selectedDate) return;
            setOrderByServiceDate((prev) => ({
              ...prev,
              [getServiceDateKey(selectedService.id, selectedDate)]: items,
            }));
            toast({
              title: "Success",
              description: "Order of service updated",
            });
          }}
        />

        <SpecialAttendanceModal
          isOpen={isSpecialAttendanceModalOpen}
          onClose={() => {
            setIsSpecialAttendanceModalOpen(false);
            setSelectedSpecialService(null);
            setSelectedDate(null);
          }}
          service={selectedSpecialService}
          date={selectedDate}
          onSave={handleSpecialAttendanceSaved}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <Heading level={2}>Attendance</Heading>

          {hasServices && (
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[320px] gap-3">
            <Loader size="w-12 h-12" />
            <Text variant="default">Loading services...</Text>
          </div>
        ) : !hasServices ? (
          <AttendanceEmptyState onCreateService={handleCreateServiceClick} />
        ) : (
          <div>
            <CalendarGrid
              services={regularServices}
              specialServices={specialServices}
              searchQuery={searchQuery}
              givingTotals={givingTotals}
              onAddAttendance={handleAddAttendance}
              onViewServiceDetails={handleViewServiceDetails}
              onAddGivingRecord={handleAddGivingRecord}
              onAddService={handleAddService}
              onAddSpecialAttendance={handleAddSpecialAttendance}
            />
          </div>
        )}
      </div>

      <ServiceTypeModal
        open={isTypeModalOpen}
        onOpenChange={setIsTypeModalOpen}
        onSelectType={handleSelectServiceType}
      />

      <CreateRegularServiceModal
        open={isRegularModalOpen}
        onOpenChange={setIsRegularModalOpen}
        onCreateServices={handleCreateServices}
      />

      <CreateSpecialServiceModal
        open={isSpecialModalOpen}
        onOpenChange={setIsSpecialModalOpen}
        onCreateService={handleCreateSpecialService}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        service={selectedService}
        date={selectedDate}
        onSave={handleAttendanceSaved}
      />

      <GivingRecordModal
        open={isGivingRecordModalOpen}
        onOpenChange={setIsGivingRecordModalOpen}
        service={selectedService}
        date={selectedDate}
        initialValues={selectedKey ? givingRecords[selectedKey] : undefined}
        onSave={handleSaveGivingRecord}
      />

      <ServiceDetailModal
        open={isServiceDetailModalOpen}
        onOpenChange={setIsServiceDetailModalOpen}
        service={selectedService}
        date={selectedDate}
        orderItems={
          selectedKey
            ? orderByServiceDate[selectedKey] || DEFAULT_ORDER
            : DEFAULT_ORDER
        }
        canEditOrder={Boolean(
          selectedService?.frequency === ServiceFrequency.WEEKLY &&
          isFutureService,
        )}
        onSaveOrder={(items) => {
          if (!selectedService || !selectedDate) return;
          setOrderByServiceDate((prev) => ({
            ...prev,
            [getServiceDateKey(selectedService.id, selectedDate)]: items,
          }));
          toast({
            title: "Success",
            description: "Order of service updated",
          });
        }}
      />

      <SpecialAttendanceModal
        isOpen={isSpecialAttendanceModalOpen}
        onClose={() => {
          setIsSpecialAttendanceModalOpen(false);
          setSelectedSpecialService(null);
          setSelectedDate(null);
        }}
        service={selectedSpecialService}
        date={selectedDate}
        onSave={handleSpecialAttendanceSaved}
      />
    </div>
  );
}
