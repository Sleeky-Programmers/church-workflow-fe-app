"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchServices } from "@/lib/api";
import { RegularService } from "@/types";
import { AttendanceModal } from "./attendance-modal";
import { CalendarGrid } from "./calendar-grid";
import { CreateRegularServiceModal } from "./create-regular-service";
import { ServiceTypeModal } from "./service-type";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

export function AttendanceCalendarPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<RegularService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<RegularService | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [isServiceTypeModalOpen, setIsServiceTypeModalOpen] = useState(false);
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] =
    useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchServices("2025-05");
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

  const handleAddAttendance = (service: RegularService, date: string) => {
    setSelectedService(service);
    setSelectedDate(date);
    setIsAttendanceModalOpen(true);
  };

  const handleAddGivingRecord = (service: RegularService, date: string) => {
    toast({
      title: "Coming Soon",
      description: "Giving record functionality will be available soon",
    });
  };

  const handleAddService = () => {
    setIsServiceTypeModalOpen(true);
  };

  const handleServiceTypeSelect = (type: "regular" | "special") => {
    if (type === "regular") {
      setIsCreateServiceModalOpen(true);
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

  const handleAttendanceSaved = () => {
    loadServices();
    toast({
      title: "Success",
      description: "Attendance saved successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <Text variant="default" className="mt-4">
            Loading calendar...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <Heading level={1}>Attendance</Heading>

          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <CalendarGrid
          services={services}
          onAddAttendance={handleAddAttendance}
          onAddGivingRecord={handleAddGivingRecord}
          onAddService={handleAddService}
        />
      </div>

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        service={selectedService}
        date={selectedDate}
        onSave={handleAttendanceSaved}
      />

      <ServiceTypeModal
        open={isServiceTypeModalOpen}
        onOpenChange={setIsServiceTypeModalOpen}
        onSelectType={handleServiceTypeSelect}
      />

      <CreateRegularServiceModal
        open={isCreateServiceModalOpen}
        onOpenChange={setIsCreateServiceModalOpen}
        onCreateServices={handleCreateServices}
      />
    </div>
  );
}
