import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
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

    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      sub: user._id.toString(), // must be ObjectId,
      uuid: user.uuid,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      username: user.username,
      accessToken: accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async findAll() {
    return await this.userModel
      .find()
      .select('uuid username role createdAt updatedAt');
  }

  async findOne(uuid: string) {
    const user = await this.userModel
      .findOne({ uuid })
      .select('uuid username role createdAt updatedAt');

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async getMe(uuid: string) {
    const me = await this.userModel
      .findOne({ uuid: uuid.startsWith('user-') ? uuid : `user-${uuid}` })
      .select('uuid username role createdAt updatedAt');

    if (!me) {
      throw new NotFoundException('user not found');
    }

    return me;
  }

  async update(uuid: string, updateAuthDto: UpdateAuthDto) {
    try {
      const user = await this.userModel.findOne({ uuid });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      // whitelist for admin
      if (updateAuthDto.username) {
        user.username = updateAuthDto.username;
      }
      if (updateAuthDto.password) {
        user.password = await bcrypt.hash(updateAuthDto.password, 8);
      }
      if ((updateAuthDto as any).role) {
        user.role = (updateAuthDto as any).role;
      }
      await user.save();
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

  async updateMe(uuid: string, updateAuthDto: UpdateAuthDto) {
    try {
      const user = await this.userModel.findOne({ uuid });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      // whitelist for user
      if (updateAuthDto.username) {
        user.username = updateAuthDto.username;
      }
      if (updateAuthDto.password) {
        user.password = await bcrypt.hash(updateAuthDto.password, 8);
      }
      await user.save();
      const { password, role, ...result } = user.toObject();
      return result;
    } catch (error) {
      // error code 11000 is a status code builtin from MongoDB to handling existed data
      if (error.code === 11000) {
        throw new ConflictException('username already exists');
      }
      throw error;
    }
  }

  async remove(targetUuid: string, requesterUuid: string) {
    // admin is prohibited to delete itself
    if (targetUuid === requesterUuid) {
      throw new ForbiddenException('admin cannot delete itself');
    }
    const user = await this.userModel.findOne({ uuid: targetUuid });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    // optional hardening
    if (user.role === 'admin') {
      throw new ForbiddenException('cannot delete another admin');
    }

    await user.deleteOne();
  }

  async removeMe(userUuid: string) {
    const user = await this.userModel.findOne({ uuid: userUuid });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.role === 'admin') {
      throw new ForbiddenException('admin cannot delete itself');
    }
    await user.deleteOne();
  }
}
