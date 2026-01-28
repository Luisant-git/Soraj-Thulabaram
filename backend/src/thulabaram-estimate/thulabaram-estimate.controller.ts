import {
  Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Res,
  Query,
  NotFoundException
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
  

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    // ========= FETCH ESTIMATE =========
    const estimate = await this.service.findOne(Number(id));
    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // ========= IMAGE =========
    const imagePath = join(process.cwd(), 'src', 'assets', 'LordshivaFam.jpg');
    let imageBase64 = '';
    if (fs.existsSync(imagePath)) {
      imageBase64 = fs.readFileSync(imagePath).toString('base64');
    }

    // ========= DATE / TIME =========
    const d = new Date();
    const dateStr =
      `${String(d.getDate()).padStart(2, '0')}/` +
      `${String(d.getMonth() + 1).padStart(2, '0')}/` +
      `${d.getFullYear()}`;

    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const timeStr = `${h}:${m}:${s} ${ampm}`;

    // ========= VALUES =========
    const weight = Number(estimate.weight ?? 0);
    const touch = Number(estimate.touch ?? 0);
    const amount = Number(estimate.amount ?? 0);

    // ✅ RATE DERIVED (NO DB FIELD NEEDED)
    const rate = weight > 0 ? amount / weight : 0;

    // ========= HTML (THERMAL) =========
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Thermal Receipt</title>

<style>
@page {
  size: 80mm auto;
  margin: 5mm;
}

html, body {
  margin: 0;
  padding: 0;
  width: 80mm;
  font-family: monospace;
  font-size: 9px;
  line-height: 1.3;
  background: #fff;
  color: #000;
}

.receipt {
  padding: 5mm;
  box-sizing: border-box;
}

img {
  display: block;
  margin: 0 auto 4px auto;
  width: 38px;
}

.center { text-align: center; }

.title {
  font-weight: bold;
  font-size: 11px;
  margin: 2px 0;
}

.line {
  border-top: 1px dashed #000;
  margin: 4px 0;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 2px 0;
}

.label { white-space: nowrap; }
.value { white-space: nowrap; text-align: right; }

.bold { font-weight: bold; }

.footer {
  text-align: center;
  margin-top: 6mm;
  font-size: 10px;
  font-weight: bold;
}
</style>
</head>

<body>
<div class="receipt">

  ${imageBase64 ? `<img src="data:image/png;base64,${imageBase64}" />` : ''}

  <div class="center title">SORAJ THULABARAM</div>
  <div class="center title">ESTIMATE</div>

  <div class="line"></div>

  <div class="row">
    <div class="label">DATE</div>
    <div class="value">${dateStr} ${timeStr}</div>
  </div>

  <div class="line"></div>

  <div class="row">
    <div class="label">WEIGHT</div>
    <div class="value">${weight.toFixed(3)}</div>
  </div>

  <div class="row">
    <div class="label">TOUCH</div>
    <div class="value">${touch.toFixed(2)}</div>
  </div>

  <div class="row">
    <div class="label">RATE</div>
    <div class="value">${rate.toFixed(2)}</div>
  </div>

  <div class="row bold">
    <div class="label">AMOUNT</div>
    <div class="value">${amount.toFixed(2)}</div>
  </div>

  <div class="line"></div>

  <div class="footer">THANK YOU, VISIT AGAIN!</div>

</div>
</body>
</html>
`;

    // ========= SEND =========
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');

    return res.send(html);
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
