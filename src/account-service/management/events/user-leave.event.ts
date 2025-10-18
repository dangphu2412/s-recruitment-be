export const USER_LEAVE_EVENT = 'user-leave';
export type UserLeaveEvent = {
  id: string;
  leaveAt: Date;
  leaveReason: string;
  joinedAt: Date;
};
