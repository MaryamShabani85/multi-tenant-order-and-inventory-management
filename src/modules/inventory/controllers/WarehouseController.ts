import { Controller, Post, Body, Param, Get, Patch, Delete, Query } from '@nestjs/common';
import { WarehouseService } from '../services/WarehouseService';
import { CreateWarehouseDto } from '../dto/CreateWarehouseDto';
import { UpdateWarehouseDto } from '../dto/UpdateWarehouseDto';
import { ParamIdDto } from '../../../common/dto/ParamIdDto';
import { FilterWarehouseDto } from '../dto/FilterWarehouseDto';

@Controller('warehouses') // مسیر پایه استاندارد و جمع: /warehouses
export class WarehouseController {
    constructor(private readonly warehouseService: WarehouseService) { }

    // POST /warehouses
    @Post()
    create(@Body() warehouseDto: CreateWarehouseDto) {
        return this.warehouseService.create(warehouseDto);
    }

    // GET /warehouses?page=1&limit=10&code=...
    @Get()
    findAll(@Query() filterDto: FilterWarehouseDto) {
        return this.warehouseService.findAll(filterDto);
    }

    // GET /warehouses/:id
    @Get(':id')
    findOne(@Param() params: ParamIdDto) {
        return this.warehouseService.findOne(params);
    }

    // PATCH /warehouses/:id
    @Patch(':id')
    update(
        @Param() params: ParamIdDto,
        @Body() warehouseDto: UpdateWarehouseDto,
    ) {
        return this.warehouseService.update(params, warehouseDto);
    }

    // DELETE /warehouses/:id
    @Delete(':id')
    delete(@Param() params: ParamIdDto) {
        return this.warehouseService.delete(params);
    }

    // POST /warehouses/:id/active
    @Post(':id/active')
    active(@Param() params: ParamIdDto) {
        return this.warehouseService.active(params);
    }

    // POST /warehouses/:id/deactive
    @Post(':id/deactive')
    deActive(@Param() params: ParamIdDto) {
        return this.warehouseService.deActive(params);
    }
}