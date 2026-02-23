"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RegularService } from "@/types";
import { AttendanceEmptyState } from "@/components/features/dashboard/attendance/attendance-empty-state";
import { ServiceTypeModal } from "@/components/features/dashboard/attendance/service-type";
import { CreateRegularServiceModal } from "@/components/features/dashboard/attendance/create-regular-service";
import { MobileAttendanceView } from "@/components/features/dashboard/attendance/mobile-view";
import { CalendarGrid } from "@/components/features/dashboard/attendance/calendar-grid";
import Heading from "@/components/ui/typography/Heading";

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
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isRegularModalOpen, setIsRegularModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isServiceTypeModalOpen, setIsServiceTypeModalOpen] = useState(false);

  const handleCreateServiceClick = () => {
    setIsTypeModalOpen(true);
  };

  const handleSelectServiceType = (type: "regular" | "special") => {
    if (type === "regular") {
      setIsRegularModalOpen(true);
    } else {
      toast({
        title: "Coming Soon",
        description: "Special service creation will be available soon",
      });
    }
  };

  const handleCreateServices = (newServices: RegularService[]) => {
    setServices((prev) => [...prev, ...newServices]);
    toast({
      title: "Success",
      description: `${newServices.length} service(s) created successfully`,
    });
  };

  const handleAddService = () => {
    setIsServiceTypeModalOpen(true);
  };

  const handleAddAttendance = (service: RegularService, date: string) => {
    toast({
      title: "Add Attendance",
      description: `Opening attendance for ${service.serviceName}`,
    });
  };

  const handleAddGivingRecord = (service: RegularService, date: string) => {
    toast({
      title: "Add Giving Record",
      description: `Opening giving record for ${service.serviceName}`,
    });
  };

  const hasServices = services.length > 0;

  if (isMobile) {
    return (
      <>
        <MobileAttendanceView
          services={services}
          onAddAttendance={handleAddAttendance}
          onAddGivingRecord={handleAddGivingRecord}
          onSelectRegularService={() => {
            setIsTypeModalOpen(false);
            setIsRegularModalOpen(true);
          }}
          onSelectSpecialService={() => {
            toast({
              title: "Coming Soon",
              description: "Special service creation will be available soon",
            });
          }}
        />

        <CreateRegularServiceModal
          open={isRegularModalOpen}
          onOpenChange={setIsRegularModalOpen}
          onCreateServices={handleCreateServices}
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
        {!hasServices ? (
          <AttendanceEmptyState onCreateService={handleCreateServiceClick} />
        ) : (
          <div>
            <CalendarGrid
              services={services}
              onAddAttendance={handleAddAttendance}
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
    </div>
  );
}
