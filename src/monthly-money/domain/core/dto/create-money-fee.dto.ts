export type CreateMoneyFeeDTO = {
  monthlyConfigId: number;
  userIds: string[];
};

export type CreateMoneyFeeResultsDTO = {
  items: {
    userId: string;
    operationFeeId: number;
  }[];
};
