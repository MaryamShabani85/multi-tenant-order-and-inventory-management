import { IsEmail, isEmail, IsString, MinLength } from 'class-validator';

export class LoginDto
{
    @IsString()
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}
