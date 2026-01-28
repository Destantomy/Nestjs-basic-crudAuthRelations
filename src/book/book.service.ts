import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from 'src/schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { title } from 'process';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createBookDto: CreateBookDto, user: { _id: string }) {
    try {
      const book = await this.bookModel.create({
        author: user._id,
        ...createBookDto,
      });

      const populatedBook = await book.populate({
        path: 'author',
        select: 'uuid username',
      });

      const author = populatedBook.author;
      if (author instanceof mongoose.Types.ObjectId) {
        throw new InternalServerErrorException(
          'Author relation was not populated',
        );
      }

      return {
        id: populatedBook.uuid,
        title: populatedBook.title,
        author: {
          id: author.uuid,
          username: author.username,
        },
        createdAt: populatedBook.createdAt,
        updatedAt: populatedBook.updatedAt,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('title already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const books = await this.bookModel.find().populate({
      path: 'author',
      select: 'uuid username',
    });

    return books.map((book) => ({
      id: book.uuid,
      title: book.title,
      author: {
        id: (book.author as any).uuid,
        username: (book.author as any).username,
      },
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }));
  }

  async findAllMine(user: { _id: mongoose.Types.ObjectId }) {
    const mine = await this.bookModel.find({ author: user._id }).populate({
      path: 'author',
      select: 'uuid username',
    });

    return mine.map((books) => ({
      id: books.uuid,
      title: books.title,
      author: {
        id: (books.author as any).uuid,
        username: (books.author as any).username,
      },
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
    }));
  }

  async findOneAdmin(uuid: string) {
    const book = await this.bookModel
      .findOne({
        uuid: uuid.startsWith('book-') ? uuid : `book-${uuid}`,
      })
      .populate({
        path: 'author',
        select: 'uuid username',
      });
    if (!book) {
      throw new NotFoundException('book not found');
    }
    return {
      id: book.uuid,
      title: book.title,
      author: {
        id: (book.author as any).uuid,
        username: (book.author as any).username,
      },
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async findOne(user: { _id: mongoose.Types.ObjectId }, uuid: string) {
    const book = await this.bookModel
      .findOne({
        author: user._id,
        uuid: uuid.startsWith('book-') ? uuid : `book-${uuid}`,
      })
      .populate({
        path: 'author',
        select: 'uuid username',
      });

    if (!book) {
      throw new NotFoundException('book not found');
    }
    return {
      id: book.uuid,
      title: book.title,
      author: {
        id: (book.author as any).uuid,
        username: (book.author as any).username,
      },
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async updateAdmin(uuid: string, updateBookDto: UpdateBookDto) {
    try {
      const book = await this.bookModel
        .findOne({
          uuid: uuid.startsWith('book-') ? uuid : `book-${uuid}`,
        })
        .select('title updatedAt');
      if (!book) {
        throw new NotFoundException('book not found');
      }
      // whitelist for admin
      if (updateBookDto.title) {
        book.title = updateBookDto.title;
      }
      await book.save();
      return {
        title: book.title,
        updatedAt: book.updatedAt,
      };
    } catch (error) {
      // error code 11000 is a status code builtin from MongoDB to handling existed data
      if (error.code === 11000) {
        throw new ConflictException('book title already exists');
      }
      throw error;
    }
  }

  async update(
    user: { _id: mongoose.Types.ObjectId },
    uuid: string,
    updateBookDto: UpdateBookDto,
  ) {
    try {
      const book = await this.bookModel
        .findOne({
          author: user._id,
          uuid: uuid.startsWith('book-') ? uuid : `book-${uuid}`,
        })
        .select('title updatedAt');
      if (!book) {
        throw new NotFoundException('book not found');
      }
      // whitelist for user
      if (updateBookDto.title) {
        book.title = updateBookDto.title;
      }
      await book.save();
      return {
        title: book.title,
        updatedAt: book.updatedAt,
      };
    } catch (error) {
      // error code 11000 is a status code builtin from MongoDB to handling existed data
      if (error.code === 11000) {
        throw new ConflictException('book title already exists');
      }
      throw error;
    }
  }

  async removeAdmin(uuid: string) {
    const book = await this.bookModel.findOne({
      uuid: uuid.startsWith('book-') ? uuid : `book-${uuid}`,
    });
    if (!book) {
      throw new NotFoundException('book not found');
    }
    await book.deleteOne();
  }

  async remove(user: { _id: mongoose.Types.ObjectId }, uuid: string) {
    const book = await this.bookModel.findOne({
      author: user._id,
      uuid: uuid.startsWith('book-') ? uuid : `book-${uuid}`,
    });
    if (!book) {
      throw new NotFoundException('book not found');
    }
    await book.deleteOne();
  }
}
