import { Module } from '@nestjs/common';
import { RateService } from './rate.service';
import { RateController } from './rate.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RateController],
  providers: [RateService,PrismaService],
})
export class RateModule {}
