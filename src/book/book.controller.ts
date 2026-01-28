import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Post('post')
  async create(@Req() req, @Body() createBookDto: CreateBookDto) {
    return await this.bookService.create(createBookDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('me')
  async findAllMine(@Req() req) {
    const mine = await this.bookService.findAllMine(req.user);
    return {
      statusCode: 200,
      message: 'accepted',
      data: mine,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @Get(':uuid')
  async findOneAdmin(@Param('uuid') uuid: string) {
    const book = await this.bookService.findOneAdmin(uuid);
    return {
      statusCode: 200,
      message: 'accepted',
      data: book,
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('me/:uuid')
  async findOne(@Req() req, @Param('uuid') uuid: string) {
    const mine = await this.bookService.findOne(req.user, uuid);
    return {
      statusCode: 200,
      message: 'accepted',
      data: mine,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @Patch(':uuid')
  async updateAdmin(
    @Param('uuid') uuid: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    const book = await this.bookService.updateAdmin(uuid, updateBookDto);
    return {
      statusCode: 200,
      message: 'accepted',
      data: book,
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch('user/:uuid')
  async update(
    @Req() req,
    @Param('uuid') uuid: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    const book = await this.bookService.update(req.user, uuid, updateBookDto);
    return {
      statusCode: 200,
      message: 'accepted',
      data: book,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  @Delete(':uuid')
  async removeAdmin(@Param('uuid') uuid: string) {
    return await this.bookService.removeAdmin(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('user/:uuid')
  async remove(@Req() req, @Param('uuid') uuid: string) {
    return await this.bookService.remove(req.user, uuid);
  }
}
