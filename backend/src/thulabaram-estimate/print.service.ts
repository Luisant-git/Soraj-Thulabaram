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

        // ===== PRINT LOGO IF EXISTS =====
        if (fs.existsSync(imagePath)) {
          escpos.Image.load(imagePath, (image: any) => {

            // Resize logo to approx 24mm (for 80mm printer)
            // 80mm full width ≈ 576px
            // 24mm ≈ 180–200px
            image.resize(200);

            printer
              .align('CT')
              .image(image, 's8')
              .then(() => {
                this.printContent(printer, data);
              });

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


  // ===== MAIN RECEIPT CONTENT =====
  private printContent(printer: any, data: any) {

    const line = '------------------------------------------------'; // 48 chars (80mm)

    printer
      .font('A')               // Standard font
      .align('CT')
      .style('B')
      .size(1, 1)
      .text('VELAN THULABARAM')

      .style('NORMAL')
      .text(line)

      .align('LT')
      .text(`DATE : ${data.date} ${data.time}`)
      .text(line)

      .text(this.row('WEIGHT', Number(data.weight).toFixed(3)))
      .text(this.row('TOUCH', Number(data.touch).toFixed(2)))
      .text(this.row('RATE', Number(data.rate).toFixed(2)))

      .style('B')
      .text(this.row('AMOUNT', Number(data.amount).toFixed(2)))

      .style('NORMAL')
      .text(line)

      .align('CT')
      .text('THANK YOU, VISIT AGAIN!')

      .feed(2)
      .cut()
      .close();
  }


  // ===== ALIGN LEFT / RIGHT (48 CHAR WIDTH) =====
  private row(label: string, value: string) {

    const totalWidth = 48; // 80mm printer width
    const left = label;
    const right = value;

    const spaces = totalWidth - left.length - right.length;

    return left + ' '.repeat(spaces > 0 ? spaces : 1) + right;
  }
}
