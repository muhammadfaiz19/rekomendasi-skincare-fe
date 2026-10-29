export type APIResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type APIError = {
  success: false;
  message: string;
  data: null;
};
