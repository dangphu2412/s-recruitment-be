import { DateRange } from 'src/system/query-shape/dto/date-range.query';

export type CreateRecruitmentCommand = {
  name: string;
  location: string;
  recruitmentRange: DateRange;
  examinerIds: string[];
  scoringStandards: Array<{
    standard: string;
    point: number;
  }>;
  authorId: string;
};

export type MarkEmployeePointCommand = {
  authorId: string;
  eventId: number;
  employeeId: number;
  point: number;
  note: string;
};

export type ImportEmployeesCommand = {
  eventId: string;
  file: Express.Multer.File;
};
