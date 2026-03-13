"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RegularService, SpecialServiceEvent } from "@/types";
import { AttendanceEmptyState } from "@/components/features/dashboard/attendance/attendance-empty-state";
import { ServiceTypeModal } from "@/components/features/dashboard/attendance/service-type";
import { CreateRegularServiceModal } from "@/components/features/dashboard/attendance/create-regular-service";
import { CreateSpecialServiceModal } from "@/components/features/dashboard/attendance/create-special-service";
import { AttendanceModal } from "@/components/features/dashboard/attendance/attendance-modal";
import { MobileAttendanceView } from "@/components/features/dashboard/attendance/mobile-view";
import { CalendarGrid } from "@/components/features/dashboard/attendance/calendar-grid";
import { GivingRecordModal } from "@/components/features/dashboard/attendance/giving-record-modal";
import { ServiceDetailModal } from "@/components/features/dashboard/attendance/service-detail-modal";
import { GivingValues } from "@/components/features/dashboard/attendance/giving-record-modal";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { DEFAULT_ORDER } from "@/lib/data";
import { ServiceFrequency, ServiceType } from "@/lib/enums";
import { fetchServices } from "@/lib/api";
import { format } from "date-fns";

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
  const [services, setServices] = useState<RegularService[]>([]);
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
  const [specialServices, setSpecialServices] = useState<SpecialServiceEvent[]>(
    [],
  );

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const data = await fetchServices(format(new Date(), "yyyy-MM"));
        setServices(data);
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

    loadServices();
  }, [toast]);

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

  const handleCreateServices = (newServices: RegularService[]) => {
    setServices((prev) => [...prev, ...newServices]);
  };

  const handleAddService = () => {
    setIsTypeModalOpen(true);
  };

  const handleCreateSpecialService = (service: SpecialServiceEvent) => {
    setSpecialServices((prev) => [...prev, service]);
    toast({
      title: "Success",
      description: "Special service created successfully",
    });
  };

  const handleAddAttendance = (service: RegularService, date: string) => {
    setServiceContext(service, date);
    setIsAttendanceModalOpen(true);
  };

  const handleAddGivingRecord = (service: RegularService, date: string) => {
    setServiceContext(service, date);
    setIsGivingRecordModalOpen(true);
  };

  const handleViewServiceDetails = (service: RegularService, date: string) => {
    setServiceContext(service, date);
    setIsServiceDetailModalOpen(true);
  };

  const hasServices = services.length > 0 || specialServices.length > 0;

  if (isMobile) {
    return (
      <>
        <MobileAttendanceView
          services={services}
          onAddAttendance={handleAddAttendance}
          onAddGivingRecord={handleAddGivingRecord}
          onViewServiceDetails={handleViewServiceDetails}
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
          onSave={() => {
            toast({
              title: "Success",
              description: "Attendance saved successfully",
            });
          }}
        />

        <GivingRecordModal
          open={isGivingRecordModalOpen}
          onOpenChange={setIsGivingRecordModalOpen}
          service={selectedService}
          date={selectedDate}
          initialValues={selectedKey ? givingRecords[selectedKey] : undefined}
          onSave={(values) => {
            if (selectedService && selectedDate) {
              setGivingRecords((prev) => ({
                ...prev,
                [getServiceDateKey(selectedService.id, selectedDate)]: values,
              }));
            }
            toast({
              title: "Success",
              description: "Giving record saved successfully",
            });
          }}
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
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
              <Text variant="default" className="mt-3">
                Loading services...
              </Text>
            </div>
          </div>
        ) : !hasServices ? (
          <AttendanceEmptyState onCreateService={handleCreateServiceClick} />
        ) : (
          <div>
            <CalendarGrid
              services={services}
              specialServices={specialServices}
              searchQuery={searchQuery}
              givingTotals={givingTotals}
              onAddAttendance={handleAddAttendance}
              onViewServiceDetails={handleViewServiceDetails}
              onAddGivingRecord={handleAddGivingRecord}
              onAddService={handleAddService}
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
        onSave={() => {
          toast({
            title: "Success",
            description: "Attendance saved successfully",
          });
        }}
      />

      <GivingRecordModal
        open={isGivingRecordModalOpen}
        onOpenChange={setIsGivingRecordModalOpen}
        service={selectedService}
        date={selectedDate}
        initialValues={selectedKey ? givingRecords[selectedKey] : undefined}
        onSave={(values) => {
          if (selectedService && selectedDate) {
            setGivingRecords((prev) => ({
              ...prev,
              [getServiceDateKey(selectedService.id, selectedDate)]: values,
            }));
          }
          toast({
            title: "Success",
            description: "Giving record saved successfully",
          });
        }}
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
    </div>
  );
}
