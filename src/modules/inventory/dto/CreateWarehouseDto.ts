import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateTenantDto
{
    @IsString()
    @MaxLength(20)
    @Matches(/^[0-9-]+$/, { message: 'کد انبار فقط می‌تواند شامل اعداد و خط تیره باشد.' })
    code!: string;

    @IsString()
    @MaxLength(255)
    name!: string;

    @IsString()
    @MaxLength(500)
    address!: string;
}
