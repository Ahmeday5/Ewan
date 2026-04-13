export interface SendNotificationRequest {
  title: string;
  body: string;
}

export interface SendNotificationResponse {
  statusCode: number;
  message: string;
  data: {
    messageId: string;
  };
}
