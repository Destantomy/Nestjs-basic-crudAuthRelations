import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title invalid' })
  @MinLength(6, { message: 'title should have minimum 6 characters' })
  title: string;
}
