export type UserManagementViewDTO = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: Date;
  deletedAt: Date;
  joinedAt: Date;
  roles: {
    id: string;
    name: string;
  }[];
  paidMonths: number;
  remainMonths: number;
  estimatedPaidMonths: number;
  debtMonths: number;
  isProbation: boolean;
  department: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    name: string;
  };
};
