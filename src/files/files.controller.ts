import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res, StreamableFile, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';

@ApiTags('Files Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,

    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  @Header('Content-Type', 'image/jpeg')
  findProductImage(
    @Param('imageName') imageName: string
  ){
    console.log(imageName)
    const stream = createReadStream(this.filesService.getStaticProductImage( imageName ));
    return new StreamableFile(stream);
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: { fileSize: 10000 }
    storage: diskStorage({
      destination: './static/products/uploads',
      filename: fileNamer
    })
  }))
  uploadProductFile( 
    @UploadedFile() file: Express.Multer.File
  ){

    if( !file ){
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${file.filename}`
    
    return {
      secureUrl
    };
  }

}
