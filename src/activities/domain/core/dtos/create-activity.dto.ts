export class CreateActivityDTO {
  authorId: string;
  requestType: string;
  timeOfDayId: string;
  dayOfWeekId: string;
  requestChangeDay?: string;
  compensatoryDay?: string;
}
