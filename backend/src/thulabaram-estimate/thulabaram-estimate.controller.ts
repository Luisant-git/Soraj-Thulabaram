import {
  Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Res,
  Query
} from '@nestjs/common';

import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { UpdateThulabaramEstimateDto } from './dto/update-thulabaram-estimate.dto';
import { ThulabaramEstimateService } from './thulabaram-estimate.service';
import { CreateThulabaramEstimateDto } from './dto/create-thulabaram-estimate.dto';

@Controller('thulabaram-estimates')
export class ThulabaramEstimateController {
  constructor(private readonly service: ThulabaramEstimateService) { }

  @Post()
  async create(@Body() dto: CreateThulabaramEstimateDto) {
    return this.service.create(dto);
  }



  @Get('inactive')
  async findAllInactive() {
    return this.service.findAllInactive();
  }

  // ✅ DOWNLOAD MUST COME BEFORE :id
  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const estimate = await this.service.findOne(Number(id));
    if (!estimate) return res.status(404).send('Estimate not found');

    const imagePath = join(
      process.cwd(),
      'src',
      'assets',
      'LordshivaFam.jpg',
    );


    if (!fs.existsSync(imagePath)) {
      return res.status(500).send('Image not found');
    }


    const imageBase64 = fs.readFileSync(imagePath).toString('base64');

    const formatDateDMY = (date: Date) => {
      const d = new Date(date); // use the passed date
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatTimeHMS = (date: Date) => {
      const d = new Date(date); // use the passed date
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    const rateValue = estimate.rate?.rate ?? 0;
    const weight = Number(estimate.weight); // ensure number
    const rate = Number(rateValue);         // ensure number
    const amount = Number((weight * rate).toFixed(2)); // round to 2 decimals


    const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #fff;
          font-family: monospace;
          font-size: 14px; /* slightly bigger */
        }
  
        .receipt {
          width: 320px;  /* slightly wider for bigger content */
          margin: 0 auto;
          color: #000;
        }
  
        img {
          display: block;
          margin: 0 auto 16px auto; /* extra gap below logo */
          width: 80px; /* bigger logo */
        }
  
        .center {
          text-align: center;
        }
  
        .title {
          font-weight: bold;
          font-size: 16px; /* slightly bigger titles */
          margin: 8px 0;   /* extra spacing like handwritten */
        }
  
        .line {
          border-top: 1px dashed #000;
          margin: 10px 0; /* slightly bigger gap between sections */
        }
  
        .row {
          display: flex;
          justify-content: center;
          margin: 8px 0; /* increased vertical gap between rows */
        }
  
        .label {
          width: 90px;       /* slightly wider */
          text-align: left;
          padding-left: 4px;
        }
  
        .colon {
          width: 12px;       /* natural small gap */
          text-align: center;
        }
  
        .value {
          flex: 1;
          text-align: left;  /* value starts nicely after colon */
          padding-left: 45px;   /* clean look */
          white-space: nowrap;
        }
  
        .footer {
          text-align: center;
          margin-top: 20px;  /* more gap above footer */
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <img src="data:image/png;base64,${imageBase64}" />
  
        <div class="center title">SORAJ THULABARAM</div>
        <div class="center title">ESTIMATE</div>
  
        <div class="line"></div>
  
        <div class="row">
  <div class="label">DATE</div>
  <div class="colon">:</div>
  <div class="value">
    ${formatDateDMY(estimate.date)} ${formatTimeHMS(estimate.date)}
  </div>
</div>

  
        <div class="line"></div>
  
        <div class="row">
          <div class="label">WEIGHT</div>
          <div class="colon">:</div>
          <div class="value">${estimate.weight}</div>
        </div>
  
        <div class="row">
          <div class="label">RATE</div>
          <div class="colon">:</div>
          <div class="value">${rateValue}</div>
        </div>
 <div class="row">
  <div class="label">AMOUNT</div>
  <div class="colon">:</div>
  <div class="value">₹ ${amount.toFixed(2)}</div>
</div>




        <div class="line"></div>
  
        <div class="footer">THANK YOU VISIT AGAIN</div>
      </div>
    </body>
  </html>
  `;




    res.set({
      'Content-Type': 'text/html',
      'Content-Disposition': 'attachment; filename="thulabaram.html"',
    });

    res.send(html);
  }


  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get()
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
    const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
  
    return this.service.findAllPaginated(pageNumber, limitNumber, search);
  }
  

  
  

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateThulabaramEstimateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
