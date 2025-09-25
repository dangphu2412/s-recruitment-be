export type CreateActivityRequestDTO = {
  authorId: string;
  requestType: string;
  timeOfDayId: string;
  dayOfWeekId?: string;
  requestChangeDay?: string;
  compensatoryDay?: string;
  reason?: string;
};
