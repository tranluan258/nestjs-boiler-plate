export interface BaseResponseForPaging<T> {
  data: T[];
  total: number;
}
