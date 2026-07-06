import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  title: string;

  @IsNumber()
  amount: number;

  @IsIn(['Food', 'Travel', 'Bills', 'Shopping'])
  category: string;

  @IsDateString()
  date: string;

  @IsOptional()
  note?: string;
}


