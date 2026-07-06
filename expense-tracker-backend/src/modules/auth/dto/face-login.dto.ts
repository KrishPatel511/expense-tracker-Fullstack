import { IsArray, ArrayMinSize, ArrayMaxSize, IsEmail, IsNumber } from 'class-validator';

export class FaceLoginDto {
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayMinSize(128)
  @ArrayMaxSize(128)
  @IsNumber({}, { each: true })
  descriptor: number[];
}
