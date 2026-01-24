// src/rate/rate.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { RateService } from './rate.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';

@Controller('rate')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  // Create a new rate
  @Post()
  create(@Body() createRateDto: CreateRateDto) {
    return this.rateService.create(createRateDto);
  }

  // Get all active rates
  @Get()
  findAll() {
    return this.rateService.findAll();
  }

  // Get one active rate by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rateService.findOne(id);
  }

  // Update an active rate
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRateDto: UpdateRateDto) {
    return this.rateService.update(id, updateRateDto);
  }

  // Soft delete (set isActive = false)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rateService.remove(id);
  }
}
