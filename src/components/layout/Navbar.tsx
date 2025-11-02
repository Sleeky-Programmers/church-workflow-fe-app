import { Bell, Search, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function Navbar() {
  return (
    <header className="w-full flex items-center h-16 gap-2 px-3 md:px-6 border-b">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="hidden sm:block mr-2 data-[orientation=vertical]:h-4"
        />

        <div className="hidden md:block min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="sm:hidden"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </Button>

        <div className="hidden sm:block">
          <Input
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Search"
            className="w-48 md:w-64"
          />
        </div>

        <Button size="icon" variant="ghost" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>
              <User className="w-4 h-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <p className="hidden sm:block">John Doe</p>
        </div>
      </div>
    </header>
  );
}
