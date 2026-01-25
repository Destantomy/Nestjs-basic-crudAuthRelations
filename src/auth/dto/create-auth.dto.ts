import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString({ message: 'username invalid' })
  @MinLength(6, { message: 'username should have minimum 6 characters' })
  username: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString({ message: 'password invalid' })
  @MinLength(6, { message: 'password should have minimum 6 characters' })
  password: string;
}
