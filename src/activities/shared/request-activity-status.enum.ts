export enum RequestActivityStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISE = 'REVISE',
}

export enum ApprovalRequestAction {
  REVISE = 'REVISE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  AUTHOR_UPDATE = 'AUTHOR_UPDATE',
}

export enum RequestTypes {
  WORKING = 'Working',
  LATE = 'Late',
  ABSENCE = 'Absence',
}
