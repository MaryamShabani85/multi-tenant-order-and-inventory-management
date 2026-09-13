import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRoleEnum } from '../../../enum/UserRoleEnum';

export class CreateUserDto
{
    @IsString()
    @IsEmail()
    @MaxLength(255)
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsString()
    @MaxLength(150)
    fullName!: string;

    @IsEnum(UserRoleEnum)
    role!: UserRoleEnum;
}
