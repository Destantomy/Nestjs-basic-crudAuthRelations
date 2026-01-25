import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty({ message: 'username required' })
  @IsString({ message: 'username invalid' })
  @MinLength(6, { message: 'username should have minimum 6 characters' })
  username: string;

  @IsNotEmpty({ message: 'password required' })
  @IsString({ message: 'password invalid' })
  @MinLength(6, { message: 'password should have minimum 6 characters' })
  password: string;
}
