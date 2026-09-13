import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';

export class CreateTenantDto
{
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString()
    @MaxLength(100)
    @Matches(/^[a-z0-9-]+$/, { message: 'شناسه سازمان فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد.' })
    slug!: string;

    @IsEnum(TenantStatusEnum)
    status!: TenantStatusEnum;
}
