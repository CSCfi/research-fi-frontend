export type NotificationObject = {
  notificationText: string;
  buttons: { label: string; action: any }[];
};

export type CustomErrorType = { status?: number; message?: string };
