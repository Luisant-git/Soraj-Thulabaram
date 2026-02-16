import {
  Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Res,
  Query,
  NotFoundException
} from '@nestjs/common';

import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import PDFDocument = require('pdfkit');
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
  

  @Get('download-pdf/:id')
async downloadPdf(@Param('id') id: string, @Res() res: Response) {
  const estimate = await this.service.findOne(Number(id));
  if (!estimate) throw new NotFoundException('Estimate not found');

  const weight = Number(estimate.weight ?? 0);
  const touch = Number(estimate.touch ?? 0);
  const amount = Number(estimate.amount ?? 0);
  const rate = weight > 0 ? amount / weight : 0;

  // --- Format like: 16/2/2026  12:00:37
  const d = new Date();
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  const timeStr =
    `${String(d.getHours()).padStart(2, '0')}:` +
    `${String(d.getMinutes()).padStart(2, '0')}:` +
    `${String(d.getSeconds()).padStart(2, '0')}`;

  const imagePath = join(process.cwd(), 'src', 'assets', 'LordshivaFam.jpg');
  const hasLogo = fs.existsSync(imagePath);

  // 3 inch width = 216pt
  const W = 216;
  const pad = 10;
  const lineGap = 14;
  const H = hasLogo ? 320 : 260;

  // ✅ Use ONE label width for ALL rows (important for alignment)
  const LABEL_W = 55;
  const valueX = pad + LABEL_W;
  const valueW = (W - pad) - valueX; // right edge = W - pad

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="thulabaram-${id}.pdf"`);
  res.setHeader('Cache-Control', 'no-store');

  const doc = new PDFDocument({
    size: [W, H],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  doc.pipe(res);

  let y = 12;

  if (hasLogo) {
    const imgW = 42;
    const x = (W - imgW) / 2;
    doc.image(imagePath, x, y, { width: imgW });
    y += 55;
  }

  doc.font('Courier-Bold').fontSize(12).text('VELAN THULABARAM', pad, y, {
    width: W - pad * 2,
    align: 'center',
  });
  y += 20;

  const hr = () => {
    doc
      .moveTo(pad, y)
      .lineTo(W - pad, y)
      .dash(2, { space: 2 })
      .stroke()
      .undash();
    y += 10;
  };

  // ✅ normal rows (label left, value right) — consistent columns
  const row = (label: string, value: string, bold = false) => {
    doc.font(bold ? 'Courier-Bold' : 'Courier').fontSize(10);

    doc.text(label, pad, y, { width: LABEL_W, align: 'left', lineBreak: false });
    doc.text(value, valueX, y, { width: valueW, align: 'right', lineBreak: false });

    y += lineGap;
  };

  // ✅ DATE row: date left + time right WITHOUT overlap
  const rowDateTime = (label: string, dateValue: string, timeValue: string) => {
    doc.font('Courier').fontSize(10);

    // label
    doc.text(label, pad, y, { width: LABEL_W, align: 'left', lineBreak: false });

    // compute exact X for time at right edge
    const gap = 6; // space between date and time
    const timeTextW = doc.widthOfString(timeValue);
    const timeXExact = valueX + valueW - timeTextW; // right aligned exact

    // date can occupy only until (timeXExact - gap)
    const maxDateW = Math.max(0, (timeXExact - gap) - valueX);

    // draw date (left)
    doc.text(dateValue, valueX, y, {
      width: maxDateW,
      align: 'left',
      lineBreak: false,
      ellipsis: true,
    });

    // draw time (right) last
    doc.text(timeValue, timeXExact, y, { lineBreak: false });

    y += lineGap;
  };

  // ---- content
  hr();
  rowDateTime('DATE:', dateStr, timeStr);  // ✅ your required format
  hr();

  row('WEIGHT', weight.toFixed(3));
  row('TOUCH', touch.toFixed(2));
  row('RATE', rate.toFixed(2));
  row('AMOUNT', amount.toFixed(2), true);

  hr();

  doc.font('Courier-Bold').fontSize(10).text('THANK YOU, VISIT AGAIN!', pad, y + 8, {
    width: W - pad * 2,
    align: 'center',
  });

  doc.end();
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
