import { IsEnum, IsString, MaxLength } from 'class-validator';
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';

export class RegisterTenantDto
{
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString()
    @MaxLength(100)
    slug!: string;

    @IsEnum(TenantStatusEnum)
    status!: TenantStatusEnum;
}
