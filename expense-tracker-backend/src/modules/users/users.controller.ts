import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Protected route - sirf valid JWT token ke saath access hoga

  @ApiTags('Users')          // 👈 "default" section se nikal ke "Users" me aayega
@ApiBearerAuth()           // 👈 Swagger ab token attach karega
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: { userId: string; email: string }) {
    return this.usersService.findById(user.userId);
  }
}
