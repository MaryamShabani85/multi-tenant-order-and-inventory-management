import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { CreateWarehouseDto } from './CreateWarehouseDto';

export class FilterWarehouseDto extends PartialType(CreateWarehouseDto)
{
    @IsOptional()
    @IsBoolean()
    isActive!: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 100;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;
}
