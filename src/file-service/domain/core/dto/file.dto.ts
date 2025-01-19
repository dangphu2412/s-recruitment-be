export type CreateFileDTO = Express.Multer.File;
export type CreatedFileDTO = {
  path: string;
};

export type LogDTO = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
};
