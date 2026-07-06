import { IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from 'class-validator';

export class RegisterFaceDto {
  @IsArray()
  @ArrayMinSize(128)
  @ArrayMaxSize(128)
  @IsNumber({}, { each: true })
  descriptor: number[];
}
