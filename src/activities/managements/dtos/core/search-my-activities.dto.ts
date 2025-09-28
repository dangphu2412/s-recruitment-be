export type SearchMyActivitiesDTO = {
  userId: string;
};

export type FindActivitiesResponseDTO = {
  id: number;
  requestType: string;
  requestChangeDay: string;
  compensatoryDay: string;
  createdAt: Date;
  timeOfDay: {
    id: string;
    name: string;
    fromTime: string;
    toTime: string;
  };
  dayOfWeek: {
    id: string;
    name: string;
  };
}[];
