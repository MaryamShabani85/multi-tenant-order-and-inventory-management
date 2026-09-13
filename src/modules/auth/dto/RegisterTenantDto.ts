// src/modules/auth/dto/register.dto.ts
import { ValidateNested, IsDefined } from 'class-validator';
import { CreateTenantDto } from './CreateTenantDto';
import { Type } from 'class-transformer';
import { CreateUserDto } from './CreateUserDto';

export class RegisterDto
{
    @IsDefined({ message: 'اطلاعات سازمان الزامی است.' })
    @ValidateNested()
    @Type(() => CreateTenantDto)
    tenant!: CreateTenantDto;

    @IsDefined({ message: 'اطلاعات کاربر مدیر الزامی است.' })
    @ValidateNested()
    @Type(() => CreateUserDto)
    user!: CreateUserDto;
}
