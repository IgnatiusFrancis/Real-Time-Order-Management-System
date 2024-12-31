export interface GetResponse<T> {
  status: boolean;
  message: string;
  data: T;
}
