  export type ApiSuccess<T> = {
    data: T;
    error: null;
  };

  export type ApiError = {
    data: null;
    error: {
      message: string;
      code?: string;
    };
  };

  export type ApiResponse<T> = ApiSuccess<T> | ApiError;