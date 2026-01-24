import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ThulabaramEstimateModule } from './thulabaram-estimate/thulabaram-estimate.module';
import { RateModule } from './rate/rate.module';

@Module({
  imports: [AdminModule, ThulabaramEstimateModule, RateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
