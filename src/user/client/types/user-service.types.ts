export type CreateUserPayload = {
  email: string;
  fullName: string;
  birthday?: string;
};

export type ExcelUserCreationPayload = {
  STT: string;
  'Họ và Tên:': string;
  'Chuyên môn:': string;
  Email: string;
  'Ngày sinh': number;
  Tháng: number;
  SĐT: number;
};
