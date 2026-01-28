export class CreateThulabaramEstimateDto {
  date: string;
  time: string;
  weight: number;

  rate?: number;   // 👈 ONLY for calculation (not stored)
  touch?: number;
}
