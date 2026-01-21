export type LoginFormValues = {
  email: string;
  password: string;
};

import { z } from 'zod';

export const churchIdentitySchema = z.object({
  churchName: z.string().min(1, 'Church name is required'),
  churchAlias: z.string().optional(),
  churchAddress: z.string().min(1, 'Church address is required'),
  country: z.string().min(1, 'Country is required'),
  stateProvince: z.string().optional(),
  defaultCurrency: z.string().min(1, 'Default currency is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  churchLogo: z.any().optional(),
});

export type ChurchIdentityValues = z.infer<typeof churchIdentitySchema>;

export const uploadMembersSchema = z.object({
 csvFile: z.instanceof(File).optional(),
});

export type UploadMembersValues = z.infer<typeof uploadMembersSchema>;

export const weeklyServiceSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  days: z.array(z.string()).min(1, 'At least one day is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  location: z.string().optional(),
});

export type WeeklyServiceValues = z.infer<typeof weeklyServiceSchema>;

export const weeklyServicesArraySchema = z.array(weeklyServiceSchema);

export type WeeklyServicesValues = WeeklyServiceValues[];

