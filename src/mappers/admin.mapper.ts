export interface AdminResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface AdminOption {
  id: string;
  fullName: string;
}

export function mapAdminToOption(admin: AdminResponse): AdminOption {
  return {
    id: admin.id,
    fullName: admin.fullName,
  };
}
