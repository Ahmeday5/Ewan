export interface apiResponse<T> {
  statusCode: number;
  message: string;
  data: {
    pageIndex: number;
    pageSize: number;
    count: number;
    totalPages: number;
    data: T[];
  };
}

export interface apiResponseWithoutPage<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ==============================
// ريسبونس post
// ==============================

export interface postResponse {
  statusCode: number;
  message: string;
  data: number;
}
