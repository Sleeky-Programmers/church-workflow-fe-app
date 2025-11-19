export type ActivityRow = {
  id: string;
  timestamp: string;
  user: { name: string; initials?: string };
  action: string;
  module: string;
  details: string;
};
