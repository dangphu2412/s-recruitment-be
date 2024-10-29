import { DateRange } from 'src/system/query-shape/dto/date-range.query';

export type CreateRecruitmentCommand = {
  name: string;
  location: string;
  passPoint: number;
  recruitmentRange: DateRange;
  examinerIds: string[];
  scoringStandards: Array<{
    standard: string;
    point: number;
  }>;
  authorId: string;
  file: Express.Multer.File;
};

export type MarkEmployeePointCommand = {
  authorId: string;
  eventId: number;
  employeeId: number;
  point: number;
  note: string;
};

export type ImportEmployeesCommand = {
  eventId: number;
  file: Express.Multer.File;
};
