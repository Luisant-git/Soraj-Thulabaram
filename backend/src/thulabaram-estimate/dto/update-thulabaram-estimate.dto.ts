import { PartialType } from '@nestjs/mapped-types';
import { CreateThulabaramEstimateDto } from './create-thulabaram-estimate.dto';

export class UpdateThulabaramEstimateDto extends PartialType(CreateThulabaramEstimateDto) {}
