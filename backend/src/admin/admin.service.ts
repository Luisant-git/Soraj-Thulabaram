import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/create-admin.dto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  async create(createAdminDto: CreateAdminDto) {
    const { email, password } = createAdminDto;

    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (existingAdmin) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await this.prisma.admin.create({
      data: { email, password: hashedPassword },
    });

    return {
      message: 'Admin registered successfully',
      admin: newAdmin,
    };
  }

  async login(loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new BadRequestException('This email is not registered');
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      throw new BadRequestException('Incorrect password');
    }

    return { message: 'Login successfully', admin };
  }
}
