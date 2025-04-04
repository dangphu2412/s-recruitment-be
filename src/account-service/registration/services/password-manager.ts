import { compare, genSalt, hash } from 'bcryptjs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EnvironmentKeyFactory } from 'src/system/services';

@Injectable()
export class PasswordManager implements OnModuleInit {
  private readonly saltRounds: number;
  private defaultPassword: string;

  constructor(private configService: EnvironmentKeyFactory) {
    this.saltRounds = configService.getSaltRounds();
  }

  async onModuleInit() {
    this.defaultPassword = await this.generate(
      this.configService.getDefaultPwd(),
    );
  }

  async generate(data: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);

    return hash(data, salt);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return await compare(data, encrypted);
  }

  getDefaultPassword(): string {
    return this.defaultPassword;
  }
}
