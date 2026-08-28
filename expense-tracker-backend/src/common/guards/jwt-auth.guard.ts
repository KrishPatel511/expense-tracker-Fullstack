import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Ye guard kisi bhi route ko protect karta hai.
// Controller me @UseGuards(JwtAuthGuard) lagane se wo route
// bina valid JWT token ke access nahi ho sakta.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
