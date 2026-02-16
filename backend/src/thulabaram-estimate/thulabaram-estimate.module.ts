import { Module } from '@nestjs/common';
import { ThulabaramEstimateService } from './thulabaram-estimate.service';
import { ThulabaramEstimateController } from './thulabaram-estimate.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrintService } from './print.service';

@Module({
  controllers: [ThulabaramEstimateController],
  providers: [ThulabaramEstimateService, PrismaService, PrintService],
})
export class ThulabaramEstimateModule {}
