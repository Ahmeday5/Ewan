export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface FaqListResponse {
  statusCode: number;
  message: string;
  data: Faq[];
}

export interface FaqCreateRequest {
  question: string;
  answer: string;
}

export interface FaqUpdateRequest {
  id: number;
  question: string;
  answer: string;
}

export interface FaqMutationResponse {
  statusCode: number;
  message: string;
  data: number | null;
}
