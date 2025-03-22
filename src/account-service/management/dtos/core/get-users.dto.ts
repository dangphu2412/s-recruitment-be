export type GetUsersDTO = {
  id?: string;
  withRights?: boolean;
  withRoles?: boolean;
  withDeleted?: boolean;
};

export type GetUserDTO = {
  id?: string;
  username?: string;
  withRights?: boolean;
  withRoles?: boolean;
  withDeleted?: boolean;
};
