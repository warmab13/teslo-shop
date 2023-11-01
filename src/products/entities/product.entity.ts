import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "../entities";
import { User } from "src/auth/entities/user.entity";

@Entity( {name: 'products'} )
export class Product {
    
    @ApiProperty({
        example: '58e1a47f-9cac-4fe6-8d8a-5e01017a01d1',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Men’s Chill Crew Neck Sweatshirt',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product Price'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Introducing the Tesla Chill Collection. The Men’s Chill Crew Neck Sweatshirt has a premium, heavyweight exterior and soft fleece interior for comfort in any season. The sweatshirt features a subtle thermoplastic polyurethane T logo on the chest and a Tesla wordmark below the back collar. Made from 60% cotton and 40% recycled polyester.',
        description: 'Product Description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 'mens_chill_crew_neck_sweatshirt',
        description: 'Product Slug for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int',{
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['XS', 'S', 'M', 'L'],
        description: 'Product Stock',
        default: []
    })
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty({
        example: 'men',
        description: 'Product Gender',
        default: 'men'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['sweatshirt'],
        description: 'Product Tags',
        default: []
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]


    //images
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true } 
    )
    images?: ProductImage[];

    @ManyToOne(
        ()=> User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User


    @BeforeInsert()
    checkSlugInsert(){
        if( !this.slug ){
            this.slug = this.title
        }

        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
        
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        if( !this.slug ){
            this.slug = this.title
        }

        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
        
    }
}
