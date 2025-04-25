import { compare, genSalt, hash } from 'bcryptjs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SALT_ROUNDS } from '../interfaces/password-manager.interface';

@Injectable()
export class PasswordManager implements OnModuleInit {
  @Inject(SALT_ROUNDS)
  private readonly saltRounds: number;
  private defaultPassword: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.defaultPassword = await this.generate(
      this.configService.get('DEFAULT_PASSWORD'),
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
