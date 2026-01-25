import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 8);
      const user = await this.userModel.create({
        ...createAuthDto,
        password: hashedPassword,
      });
      // return user.save(); // we don't need .save() function anymore if we were use .create() function above
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      // error code 11000 is a status code builtin from MongoDB to handling existed data
      if (error.code === 11000) {
        throw new ConflictException('username already exists');
      }
      throw error;
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userModel
      .findOne({ username: loginAuthDto.username })
      .select('+password'); // + in front of password has meaning: override default schema that excepting password into, force password field to taken too
    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      sub: user.uuid,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      status: 200,
      message: 'accepted',
      data: {
        username: user.username,
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      },
    };
  }

  async findAll() {
    const data = await this.userModel.find();
    return {
      status: 200,
      message: 'accepted',
      data: data,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
