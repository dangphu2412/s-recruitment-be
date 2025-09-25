export type FindRequestedMyActivityResponseDTO = {
  id: number;
  requestType: string;
  timeOfDay: {
    id: string;
    name: string;
  };
  dayOfWeek: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    fullName: string;
  };
  assignee: {
    id: string;
    fullName: string;
    email: string;
  };
  approver: {
    id: string;
    email: string;
  };
};
