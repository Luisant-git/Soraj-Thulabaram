// src/thulabaram-estimate/dto/create-thulabaram-estimate.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateThulabaramEstimateDto {
  @IsDateString()
  date: string;

  @IsNotEmpty()
  time: string;

  @IsNumber()
  @Min(0.01)
  weight: number;

  @IsNumber()
  rateId: number;

  
}
