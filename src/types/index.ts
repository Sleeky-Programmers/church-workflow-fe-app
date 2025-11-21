export type ActivityRow = {
  id: string;
  timestamp: string;
  user: { name: string; initials?: string };
  action: string;
  module: string;
  details: string;
};

export type NotificationTypes = {
  icon: any;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  iconBg: string;
  iconColor: string;
}
