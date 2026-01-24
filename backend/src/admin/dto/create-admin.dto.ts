import { IsEmail, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LoginAdminDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
