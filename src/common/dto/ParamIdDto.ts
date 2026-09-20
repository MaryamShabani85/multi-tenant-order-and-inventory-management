import { IsString, Length } from 'class-validator';

export class ParamIdDto {
  @IsString()
  @Length(26, 26, { message: 'شناسه وارد شده نامعتبر است (طول شناسه باید ۲۶ کاراکتر باشد).' })
  id!: string;
}