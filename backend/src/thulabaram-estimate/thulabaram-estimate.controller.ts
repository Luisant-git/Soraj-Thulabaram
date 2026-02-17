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
  
  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const estimate = await this.service.findOne(Number(id));
    if (!estimate) throw new NotFoundException('Estimate not found');
  
    // ===== image -> base64 =====
    const imagePath = join(process.cwd(), 'src', 'assets', 'LordshivaFam.jpg');
    let imageBase64 = '';
    let imageMime = 'image/jpeg';
  
    if (fs.existsSync(imagePath)) {
      const ext = imagePath.split('.').pop()?.toLowerCase();
      imageMime = ext === 'png' ? 'image/png' : 'image/jpeg';
      imageBase64 = fs.readFileSync(imagePath).toString('base64');
    }
  
    // ===== date/time =====
    const now = new Date();
  
    const dateIso = (estimate as any)?.date; // "YYYY-MM-DD"
    const timeStrRaw = (estimate as any)?.time; // "HH:MM" or "HH:MM:SS"
  
    const dateStr = (() => {
      if (typeof dateIso === 'string' && dateIso.includes('-')) {
        const [Y, M, D] = dateIso.split('-').map((x) => parseInt(x, 10));
        if (Y && M && D) return `${D}/${M}/${Y}`;
      }
      return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    })();
  
    // ===== 12 Hour Time Format =====
    const timeStr = (() => {
      let hours: number;
      let minutes: number;
      let seconds: number;
  
      if (typeof timeStrRaw === 'string' && timeStrRaw.length >= 5) {
        const parts = timeStrRaw.split(':').map(Number);
        hours = parts[0];
        minutes = parts[1];
        seconds = parts[2] ?? 0;
      } else {
        hours = now.getHours();
        minutes = now.getMinutes();
        seconds = now.getSeconds();
      }
  
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
  
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
    })();
  
    // ===== values =====
    const weight = Number(estimate.weight ?? 0);
    const touch = Number(estimate.touch ?? 0);
    const amount = Number(estimate.amount ?? 0);
    const rate = weight > 0 ? amount / weight : 0;
  
    // ===== HTML =====
    const html = `<!doctype html>
    <html>
    <head>
    <meta charset="utf-8" />
    <title>Receipt</title>
    
    <style>
    @media print {
      @page { size: 76.2mm auto; margin: 0; }
    }
    
    html, body{
      width: 76.2mm;
      margin:0;
      padding:0;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.4;
      color:#000;
      background:#fff;
    }
    
    .receipt{
  width: 76.2mm;
  margin:0;
  padding-top: 3mm;
  padding-bottom: 3mm;
  padding-left: 5mm;   /* LEFT PADDING FOR ALL */
  padding-right: 0;
  box-sizing: border-box;
}

    
    /* Logo centered */
    .logo{
      display:block;
      margin: 2mm auto;
      width: 24mm;
      height:auto;
    }
    
    /* Title centered */
    .title{
      text-align:center;
      font-weight:700;
      font-size:15px;
      margin: 2mm 0 3mm 0;
      width:100%;
    }
    
    /* Divider */
    .hr{
      border-top: 1px dashed #000;
      margin: 4px 0;
    }
    
    .row{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.label{
  flex: 0 0 28mm;   /* Fixed label width */
}

.value{
  flex: 1;
  text-align: right;
}


    
    .date-row .value{
  text-align: left;
}



    .dtvalue .d{
      text-align:left;
    }
    
    .dtvalue .t{
      text-align:right;
    }
    
    .bold{
      font-weight:700;
      font-size:14px;
    }
    
    .footer{
      text-align:center;
      font-weight:700;
      font-size:12px;
      margin-top: 6mm;
    }
      

    </style>
    </head>
    
    <body>
    <div class="receipt">
    
      ${imageBase64 ? `<img class="logo" src="data:${imageMime};base64,${imageBase64}" />` : ``}
    
      <div class="title">VELAN THULABARAM</div>
    
      <div class="hr"></div>
    
      <div class="body-section">
    
       <div class="row date-row">
  <div class="label">DATE</div>
  <div class="value">${dateStr} ${timeStr}</div>
</div>

    
        <div class="hr"></div>
    
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
    
      </div>
    
      <div class="hr"></div>
    
      <div class="footer">
        THANK YOU, VISIT AGAIN!
      </div>
    
    </div>
    
    <script>
    window.addEventListener('message', function(e){
      if (e.data === 'PRINT') {
        window.onafterprint = function() {
          try {
            parent.postMessage('PRINT_DONE', '*');
          } catch(e) {}
        };
        
        setTimeout(function(){ window.print(); }, 200);
      }
    });
    </script>
    
    </body>
    </html>`;
    
  
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