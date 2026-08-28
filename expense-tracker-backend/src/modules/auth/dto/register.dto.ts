import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Krish Patel' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'krish@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @MinLength(6)
  password: string;
}
