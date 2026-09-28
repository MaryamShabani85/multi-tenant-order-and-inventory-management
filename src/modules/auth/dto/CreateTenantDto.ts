import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';

export class CreateTenantDto {
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString({ message: 'اسلاگ باید از نوع متنی باشد.' })
    @IsNotEmpty({ message: 'اسلاگ نمی‌تواند خالی باشد.' })
    @MaxLength(100, { message: 'اسلاگ حداکثر می‌تواند ۱۰۰ کاراکتر باشد.' })
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره میانی باشد (مثال: mobile-phones).',
    })
    slug!: string;

    @IsEnum(TenantStatusEnum)
    status!: TenantStatusEnum;
}
