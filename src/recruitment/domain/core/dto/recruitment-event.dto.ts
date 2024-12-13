import { DateRange } from 'src/system/query-shape/dto/date-range.query';

export type CreateRecruitmentEventDTO = {
  name: string;
  remark: string;
  location: string;
  passPoint: number;
  recruitmentRange: DateRange;
  examinerIds: string[];
  scoringStandards: Array<{
    standard: string;
    description: string;
    point: number;
  }>;
  authorId: string;
  file: Express.Multer.File;
};

export type MarkEmployeePointDTO = {
  authorId: string;
  eventId: number;
  employeeId: number;
  point: number;
  note: string;
};

export type ImportEmployeesDTO = {
  eventId: number;
  file: Express.Multer.File;
};
