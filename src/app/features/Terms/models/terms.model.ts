export interface Terms {
  content: string;
  htmlContent: string;
}

export interface TermsApiResponse {
  statusCode: number;
  message: string;
  data: Terms;
}
