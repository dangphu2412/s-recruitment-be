export interface TokenDTO {
  type: string;
  name: string;
  value: string;
}

export interface UserCredentialsDTO {
  tokens: TokenDTO[];
}

export interface BasicLoginDTO {
  username: string;
  password: string;
}
