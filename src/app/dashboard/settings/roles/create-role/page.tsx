"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { CreateRoleForm } from "@/components/features/dashboard/admin/mini-components/create-role-form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { Span } from "@/components/ui/typography/Text";
import { RouteConfig } from "@/config/routes";

export default function CreateRolePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(RouteConfig.dashboard.admin.roles);
  };

  const handleCancel = () => {
    router.push(RouteConfig.dashboard.admin.roles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b top-0">
        <div className="px-6 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-0 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <Span variant="default">Back</Span>
          </Button>
          <div className="flex-1 text-center">
            <Heading level={2}>Create New Role</Heading>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <CreateRoleForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          showCancelButton={true}
        />
      </main>
    </div>
  );
}
