import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Lunch at cafe' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 250 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['Food', 'Travel', 'Bills', 'Shopping'], example: 'Food' })
  @IsIn(['Food', 'Travel', 'Bills', 'Shopping'])
  category: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Team lunch' })
  @IsOptional()
  note?: string;
}


