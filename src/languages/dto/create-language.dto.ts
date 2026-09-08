import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;
}