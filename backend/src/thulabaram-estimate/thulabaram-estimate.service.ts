import { Injectable } from '@nestjs/common';
import { UpdateThulabaramEstimateDto } from './dto/update-thulabaram-estimate.dto';
import { CreateThulabaramEstimateDto } from './dto/create-thulabaram-estimate.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ThulabaramEstimateService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateThulabaramEstimateDto) {
    // 1️⃣ Get latest master rate
    const masterRate = await this.prisma.rate.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' },
    });
  
    if (!masterRate) throw new Error('No active rate');
  
    // 2️⃣ Decide rate ONLY for calculation
    const rateToUse =
      dto.rate && dto.rate > 0
        ? Number(dto.rate)        // user rate
        : Number(masterRate.rate); // master rate
  
    // 3️⃣ Calculate amount
    const weight = Number(dto.weight);
    const amount = weight * rateToUse;
  
    // 4️⃣ Save ONLY required fields
    const estimate = await this.prisma.thulabaramEstimate.create({
      data: {
        date: new Date(dto.date),
        time: dto.time,
        weight,
        rateId: masterRate.id, // ✅ always master
        touch: dto.touch ?? null,
        amount,
      },
      include: { rate: true },
    });
  
    // 5️⃣ Attach usedRate ONLY for response / receipt
    return {
      ...estimate,
      usedRate: rateToUse, // 👈 NOT stored in DB
    };
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

  async update(
    id: number,
    updateDto: UpdateThulabaramEstimateDto & { rate?: number; touch?: number },
  ) {
    // 1️⃣ Fetch existing estimate
    const existing = await this.prisma.thulabaramEstimate.findUnique({
      where: { id },
    });
  
    if (!existing || !existing.isActive) {
      throw new Error(`ThulabaramEstimate with ID ${id} not found or inactive`);
    }
  
    const data: any = {};
  
    // 2️⃣ Date & time
    if (updateDto.date) data.date = new Date(updateDto.date);
    if (updateDto.time) data.time = updateDto.time;
  
    // 3️⃣ Weight
    const weight =
      updateDto.weight !== undefined
        ? Number(updateDto.weight)
        : existing.weight;
  
    data.weight = weight;
  
    // 4️⃣ Touch (saved only)
    if (updateDto.touch !== undefined) {
      data.touch = Number(updateDto.touch);
    }
  
    // 5️⃣ AMOUNT LOGIC (CRITICAL)
    if (updateDto.rate !== undefined && Number(updateDto.rate) > 0) {
      // ✅ user edited rate → recalc
      const rateValue = Number(updateDto.rate);
      data.amount = weight * rateValue;
    } else {
      // ✅ user did NOT edit rate → keep old amount
      data.amount = existing.amount;
    }
  
    // 6️⃣ rateId NEVER changes on edit
    data.rateId = existing.rateId;
  
    return this.prisma.thulabaramEstimate.update({
      where: { id },
      data,
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
