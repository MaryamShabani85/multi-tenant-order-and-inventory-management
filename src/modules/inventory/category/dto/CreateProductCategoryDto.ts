import { IsOptional, IsString, Length, Matches, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateProductCategoryDto {
    @IsOptional()
    @IsString({ message: 'شناسه دسته والد باید از نوع متنی باشد.' })
    @Length(26, 26, { message: 'شناسه وارد شده نامعتبر است (طول شناسه باید ۲۶ کاراکتر باشد).' })
    parentCategoryId?: string;

    @IsString({ message: 'نام دسته‌بندی باید از نوع متنی باشد.' })
    @IsNotEmpty({ message: 'نام دسته‌بندی نمی‌تواند خالی باشد.' })
    @MaxLength(255, { message: 'نام دسته‌بندی حداکثر می‌تواند ۲۵۵ کاراکتر باشد.' })
    name!: string;

    @IsString({ message: 'اسلاگ باید از نوع متنی باشد.' })
    @IsNotEmpty({ message: 'اسلاگ نمی‌تواند خالی باشد.' })
    @MaxLength(100, { message: 'اسلاگ حداکثر می‌تواند ۱۰۰ کاراکتر باشد.' })
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره میانی باشد (مثال: mobile-phones).',
    })
    slug!: string;
}
