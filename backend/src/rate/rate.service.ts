// src/rate/rate.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';

@Injectable()
export class RateService {
  constructor(private prisma: PrismaService) {}

  async create(createRateDto: CreateRateDto) {
    const date = new Date(createRateDto.date);
  
    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${createRateDto.date}`);
    }
  
    return this.prisma.rate.create({
      data: {
        date,
        rate: createRateDto.rate,
        isActive: createRateDto.isActive ?? true, // default true if not provided
      },
    });
  }
  

  async findAll() {
    return this.prisma.rate.findMany({
      where: { isActive: true }, // only active rates
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const rate = await this.prisma.rate.findUnique({ where: { id } });
    if (!rate || !rate.isActive) throw new NotFoundException(`Rate with id ${id} not found`);
    return rate;
  }

  async update(id: number, updateRateDto: UpdateRateDto) {
    // Ensure rate exists
    await this.findOne(id);
  
    const data: any = { ...updateRateDto };
  
    // Convert date string to Date if provided
    if (updateRateDto.date) {
      const dateParts = updateRateDto.date.includes('.') 
        ? updateRateDto.date.split('.')
        : null;
  
      if (dateParts && dateParts.length === 3) {
        // DD.MM.YYYY format
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        data.date = new Date(year, month, day);
      } else {
        // ISO format YYYY-MM-DD
        data.date = new Date(updateRateDto.date);
      }
  
      if (isNaN(data.date.getTime())) {
        throw new Error(`Invalid date: ${updateRateDto.date}`);
      }
    }
  
    return this.prisma.rate.update({
      where: { id },
      data,
    });
  }
  

  // Soft delete
  async remove(id: number) {
    await this.findOne(id); // ensures rate exists and is active
    return this.prisma.rate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
