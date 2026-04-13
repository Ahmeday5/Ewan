export interface ContactUs {
  supportNumber: string;
  whatsappNumber: string;
  email: string;
}

export interface ContactUsApiResponse {
  statusCode: number;
  message: string;
  data: ContactUs;
}
