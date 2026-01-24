import { IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateRateDto {
  @IsDateString()
  date: string;

  @IsNumber()
  rate: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}