import { Length, Matches } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export class UpdateMyPasswordRequest {
  @Length(8)
  @Matches(PASSWORD_REGEX)
  currentPassword: string;

  @Length(8)
  @Matches(PASSWORD_REGEX)
  newPassword: string;
}
