"use client";

import { ReusableFilterDropdown } from "@/components/features/dashboard/filter-drop-down";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography/Text";
import { RegularService, SpecialServiceEvent } from "@/types";

type CalendarView = "week" | "month" | "year";

interface CalendarFilterDropdownProps {
  viewMode: CalendarView;
  setViewMode: (view: CalendarView) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  filterServiceId: string;
  setFilterServiceId: (id: string) => void;
  services: RegularService[];
  specialServices: SpecialServiceEvent[];
  onClearFilters: () => void;
}

export const CalendarFilterDropdown = ({
  viewMode,
  setViewMode,
  filterDate,
  setFilterDate,
  filterServiceId,
  setFilterServiceId,
  services,
  specialServices,
  onClearFilters,
}: CalendarFilterDropdownProps) => {
  const additionalSections = (
    <>
      <div className="space-y-2">
        <Text className="font-medium">By View</Text>
        <div className="flex items-center gap-2">
          {(["week", "month", "year"] as CalendarView[]).map((view) => (
            <Button
              key={view}
              size="sm"
              variant={viewMode === view ? "default" : "outline"}
              onClick={() => setViewMode(view)}
              className="h-7 capitalize"
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Text className="font-medium">By Date</Text>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
        />
      </div>

      <div className="space-y-2">
        <Text className="font-medium">By Service</Text>
        <Select value={filterServiceId} onValueChange={setFilterServiceId}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((service, index) => {
              const safeValue = service.id || `service-option-${index}`;
              return (
                <SelectItem key={`${safeValue}-${index}`} value={safeValue}>
                  {service.serviceName}
                </SelectItem>
              );
            })}
            {specialServices.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.serviceName} (Special)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <ReusableFilterDropdown
      filterSections={[]}
      title="Filters"
      triggerButtonText="Filter"
      additionalSections={additionalSections}
      showClearAll={true}
      onClearAll={onClearFilters}
      onSave={() => {}}
    />
  );
};
