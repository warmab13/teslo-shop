import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)

    private readonly productRepository: Repository<Product>,

  ){}

  async create(createProductDto: CreateProductDto) {

    try {

      // if( !createProductDto.slug ){
      //   createProductDto.slug = createProductDto.title
      //     .toLowerCase()
      //     .replaceAll(' ', '_')
      //     .replaceAll("'", '')
      // }else{
      //   createProductDto.slug = createProductDto.slug
      //     .toLowerCase()
      //     .replaceAll(' ', '_')
      //     .replaceAll("'", '')
      // }

      //Just creating instance from Product
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product );
      
      return product;

    } catch (error) {
      this.handleDbExceptions(error);
    }

  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleDbExceptions(error: any){
    if( error.code === '23505' )
    throw new BadRequestException(error.detail)

    this.logger.error(error);
    throw new InternalServerErrorException('Helppp!!!')
  }
}
