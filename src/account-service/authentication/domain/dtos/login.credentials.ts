export interface TokenDto {
  type: string;
  name: string;
  value: string;
}

export interface LoginCredentials {
  tokens: TokenDto[];
}

export interface BasicLoginDto {
  username: string;
  password: string;
}
