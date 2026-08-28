import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterFaceDto } from './dto/register-face.dto';
import { FaceLoginDto } from './dto/face-login.dto';

// Match jitna "strict" hai - jitna kam, utna strict. 0.6 face-api.js ka recommended default hai
const FACE_MATCH_THRESHOLD = 0.6;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const id = (user._id as any)?.toString?.() ?? user.id;
    return this.buildResponse(id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user._id.toString(), user.email, user.name);
  }

  // Logged-in user apna face descriptor register karta hai (Face Login enable karne ke liye)
  async registerFace(userId: string, dto: RegisterFaceDto) {
    const user = await this.usersService.saveFaceDescriptor(userId, dto.descriptor);
    if (!user) throw new BadRequestException('Could not register face');
    return { message: 'Face registered successfully' };
  }

  // Email + live face descriptor leke, stored descriptor se compare karta hai
  async loginWithFace(dto: FaceLoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.faceDescriptor || user.faceDescriptor.length === 0) {
      throw new UnauthorizedException('Face not registered for this account');
    }

    const distance = this.euclideanDistance(user.faceDescriptor, dto.descriptor);
    if (distance > FACE_MATCH_THRESHOLD) {
      throw new UnauthorizedException('Face not recognized');
    }

    return this.buildResponse(user._id.toString(), user.email, user.name);
  }

  // Do descriptors (128 numbers ke arrays) ke beech "kitna alag hai" - simple math
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  private buildResponse(userId: string, email: string, name: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, name, email },
    };
  }
}
