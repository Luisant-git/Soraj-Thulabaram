import { Injectable } from '@nestjs/common';
import { UpdateThulabaramEstimateDto } from './dto/update-thulabaram-estimate.dto';
import { CreateThulabaramEstimateDto } from './dto/create-thulabaram-estimate.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ThulabaramEstimateService {
  constructor(private prisma: PrismaService) {}


 
  async create(createDto: CreateThulabaramEstimateDto) {
    const rateData = await this.prisma.rate.findFirst({
      where: { id: createDto.rateId, isActive: true },
    });
  
    if (!rateData) {
      throw new Error(`Rate with ID ${createDto.rateId} not found or inactive`);
    }
  
    const data = {
      date: new Date(createDto.date),
      time: createDto.time,
      weight: createDto.weight,
      rateId: createDto.rateId,
      amount: createDto.weight * rateData.rate,
    };
  
    return this.prisma.thulabaramEstimate.create({
      data,
      include: { rate: true },
    });
  }
  

  
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    // Validate numbers
    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));
  
    const skip = (page - 1) * limit;
  
    // Build search condition
    const where: any = { isActive: true };
    if (search) {
      const searchNumber = Number(search);
      where.OR = [
        { weight: searchNumber || undefined },
        { rate: { rate: searchNumber || undefined } },
      ];
    }
  
    // Total count
    const total = await this.prisma.thulabaramEstimate.count({ where });
  
    // Fetch paginated data
    const data = await this.prisma.thulabaramEstimate.findMany({
      where,
      include: { rate: true },
      orderBy: { createdAt: 'desc' },
      skip,   // OFFSET
      take: limit, // LIMIT
    });
  
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
  

 
  async findAllInactive() {
    return await this.prisma.thulabaramEstimate.findMany({
      where: { isActive: false },
      orderBy: { createdAt: 'desc' },
    });
  }
 

  // Fetch a single estimate by ID (active only)
  async findOne(id: number) {
    return await this.prisma.thulabaramEstimate.findFirst({
      where: { id, isActive: true },
      include: { rate: true }, 
    });
  }


  // Update an estimate
  async update(
    id: number,
    updateDto: UpdateThulabaramEstimateDto,
  ) {
    // Fetch the existing estimate to check if it exists and get current values
    const existing = await this.prisma.thulabaramEstimate.findUnique({
      where: { id },
    });
  
    if (!existing || !existing.isActive) {
      throw new Error(`ThulabaramEstimate with ID ${id} not found or inactive`);
    }
  
    const data: any = {
      ...updateDto,
    };
  
    // Convert date string to Date if provided
    if (updateDto.date) {
      data.date = new Date(updateDto.date);
    }
  
    // If weight or rateId changes, recalculate amount
    let rateValue = existing.rateId;
  
    if (updateDto.rateId) {
      // Use new rateId
      const rateData = await this.prisma.rate.findFirst({
        where: { id: updateDto.rateId, isActive: true },
      });
  
      if (!rateData) {
        throw new Error(`Rate with ID ${updateDto.rateId} not found or inactive`);
      }
  
      data.rateId = updateDto.rateId;
      rateValue = rateData.rate;
    } else {
      // Use existing rateId
      const rateData = await this.prisma.rate.findUnique({
        where: { id: existing.rateId },
      });
      rateValue = rateData.rate;
    }
  
    if (updateDto.weight !== undefined) {
      data.amount = updateDto.weight * rateValue;
    } else if (updateDto.rateId) {
      // weight didn't change, but rate changed
      data.amount = existing.weight * rateValue;
    }
  
    return this.prisma.thulabaramEstimate.update({
      where: { id },
      data,
      include: { rate: true }, // include related Rate
    });
  }
  
  

  // Soft delete (set active = false)
  async remove(id: number) {
    return await this.prisma.thulabaramEstimate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
