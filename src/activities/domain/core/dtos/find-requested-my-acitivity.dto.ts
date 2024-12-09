export type FindRequestedMyActivityResponseDTO = {
  id: number;
  requestType: string;
  timeOfDay: string;
  dayOfWeek: string;
  author: {
    id: string;
    fullName: string;
  };
};
