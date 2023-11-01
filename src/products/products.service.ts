import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ){}

  async create(createProductDto: CreateProductDto, user: User) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ),
        user
      });
      await this.productRepository.save( product );
      
      return { ...product, images };

    } catch (error) {
      this.handleDbExceptions(error);
    }

  }

  //TODO: pagination
  async findAll( paginationDto:PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map( ({ images, ...rest }) => ({
      ...rest,
      images: images.map( img => img.url )
    })) 
  }

  async findOne( term: string ) {
    let product: Product;

    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id:term });
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug=:slug`, {
          title: term.toUpperCase(), 
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if( !product )
      throw new NotFoundException(`Product with id ${term} not found`)
    
    return product;
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return{
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto,  user: User) {

    //Product preload

    const { images, ...toUpdate } =  updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate })

    if(!product) throw new NotFoundException(`Product with id ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if( images ){
        await queryRunner.manager.delete( ProductImage, { product: { id } } );

        product.images = images.map( 
          image => this.productImageRepository.create({ url: image }) 
        )
      }

      product.user = user;
      await queryRunner.manager.save( product );

      //await this.productRepository.save(product);  
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return this.findOnePlain( id );

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDbExceptions(error)
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDbExceptions(error: any){
    if( error.code === '23505' )
    throw new BadRequestException(error.detail)

    this.logger.error(error);
    throw new InternalServerErrorException('Helppp!!!')
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

}
