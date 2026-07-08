import { IsArray, ArrayMinSize, ArrayMaxSize, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FaceLoginDto {
  @ApiProperty({ example: 'krish@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '128-float face descriptor array from face-api.js',
    type: [Number],
    minItems: 128,
    maxItems: 128,
    example: Array(128).fill(0.01),
  })
  @IsArray()
  @ArrayMinSize(128)
  @ArrayMaxSize(128)
  @IsNumber({}, { each: true })
  descriptor: number[];
}
