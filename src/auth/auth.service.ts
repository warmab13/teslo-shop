import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save( user );
      delete user.password;

      //TODO: return JWT

      return user;

    } catch (error) {
      this.handleDbErrors(error);
    }
    
  }

  private handleDbErrors( error: any ): never{
    if( error.code === '23505' )
      throw new BadRequestException( error.detail );

    console.log(error);

    throw new InternalServerErrorException(`Please check server logs`);
  }
}
