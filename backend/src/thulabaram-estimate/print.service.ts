import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

@Injectable()
export class PrintService {
  async printReceipt(data: any) {
    try {
      const device = new escpos.USB();
      const printer = new escpos.Printer(device);

      const imagePath = join(process.cwd(), 'src', 'assets', 'LordshivaFam.jpg');

      device.open(() => {
        // Print image if exists
        if (fs.existsSync(imagePath)) {
          escpos.Image.load(imagePath, (image) => {
            printer.align('CT').image(image, 's24');
            this.printContent(printer, data);
          });
        } else {
          this.printContent(printer, data);
        }
      });

      return { success: true };
    } catch (error) {
      throw new Error('Printer not connected');
    }
  }

  private printContent(printer: any, data: any) {
    printer
      .align('CT')
      .text('VELAN THULABARAM')
      .text('--------------------------------')
      .align('LT')
      .text(`DATE: ${data.date} ${data.time}`)
      .text('--------------------------------')
      .text(`WEIGHT: ${data.weight}`)
      .text(`TOUCH: ${data.touch}`)
      .text(`RATE: ${data.rate}`)
      .text(`AMOUNT: ${data.amount}`)
      .text('--------------------------------')
      .align('CT')
      .text('THANK YOU, VISIT AGAIN!')
      .cut()
      .close();
  }
}
