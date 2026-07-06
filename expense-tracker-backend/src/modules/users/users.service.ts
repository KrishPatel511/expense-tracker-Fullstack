import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async create(data: { name: string; email: string; password: string }) {
    const user = new this.userModel(data);
    return user.save();
  }

  // Face descriptor ko user document me save karta hai (Face Register step)
  async saveFaceDescriptor(userId: string, descriptor: number[]) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { faceDescriptor: descriptor },
      { new: true },
    );
  }
}
