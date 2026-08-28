import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterFaceDto } from './dto/register-face.dto';
import { FaceLoginDto } from './dto/face-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Register face for face login (JWT required)' })
  @ApiBearerAuth()
  @ApiBody({ type: RegisterFaceDto })
  @UseGuards(JwtAuthGuard)
  @Post('face/register')
  registerFace(
    @CurrentUser() user: { userId: string },
    @Body() dto: RegisterFaceDto,
  ) {
    return this.authService.registerFace(user.userId, dto);
  }

  @ApiOperation({ summary: 'Login with face descriptor' })
  @ApiBody({ type: FaceLoginDto })
  @Post('face/login')
  loginWithFace(@Body() dto: FaceLoginDto) {
    return this.authService.loginWithFace(dto);
  }
}
