import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async findAll() {
    const users = await this.authService.findAll();
    return {
      statusCode: 200,
      message: 'accepted',
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @Get('user/:uuid')
  async findOne(@Param('uuid') uuid: string) {
    const user = await this.authService.findOne(uuid);
    return {
      statusCode: 200,
      message: 'accepted',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('me')
  async getMe(@Req() req) {
    const me = await this.authService.getMe(req.user.uuid);
    // console.log(me);
    return {
      statusCode: 200,
      message: 'accepted',
      data: me,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @Patch('user/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateAuthDto: UpdateAuthDto,
  ) {
    const updatedUser = await this.authService.update(uuid, updateAuthDto);
    return {
      statusCode: 200,
      message: 'accepted',
      data: updatedUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch('me')
  async updateMe(@Req() req, @Body() updateAuthDto: UpdateAuthDto) {
    const updatedMe = await this.authService.updateMe(
      req.user.uuid,
      updateAuthDto,
    );
    return {
      statusCode: 200,
      message: 'accepted',
      data: updatedMe,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  @Delete('user/:uuid')
  async remove(@Param('uuid') uuid: string, @Req() req) {
    await this.authService.remove(uuid, req.user.uuid);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('me')
  async removeMe(@Req() req) {
    await this.authService.removeMe(req.user.uuid);
  }
}
