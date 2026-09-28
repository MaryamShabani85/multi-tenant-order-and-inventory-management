import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
    @IsOptional()
    @IsString()
    @Length(26, 26, { message: 'شناسه وارد شده نامعتبر است (طول شناسه باید ۲۶ کاراکتر باشد).' })
    parentCategoryId?: string;

    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString()
    @MaxLength(100)
    @Matches(/^[a-z0-9-]+$/, { message: 'شناسه دسته بندی کالاها فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد.' })
    slug!: string;
}
