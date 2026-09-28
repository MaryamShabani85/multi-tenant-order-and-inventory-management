import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseController } from './WarehouseController';
import { WarehouseService } from './services/WarehouseService';
import { ParamIdDto } from '../../../common/dto/ParamIdDto';
import { CreateWarehouseDto } from './dto/CreateWarehouseDto';
import { FilterWarehouseDto } from './dto/FilterWarehouseDto';
import { UpdateWarehouseDto } from './dto/UpdateWarehouseDto';

describe('WarehouseController', () => {
    let controller: WarehouseController;

    // تعریف ماک متدهای متناظر سرویس
    const mockWarehouseService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        active: jest.fn(),
        deActive: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WarehouseController],
            providers: [
                {
                    provide: WarehouseService,
                    useValue: mockWarehouseService,
                },
            ],
        }).compile();

        controller = module.get<WarehouseController>(WarehouseController);
    });

    it('باید کنترلر با موفقیت ساخته شود', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('باید متد create سرویس را با DTO مربوطه صدا بزند و نتیجه را برگرداند', async () => {
            const dto: CreateWarehouseDto = {
                code: 'WH-001',
                name: 'انبار مرکزی',
            } as CreateWarehouseDto;

            const expectedResult = { id: 'wh_1', ...dto, tenantId: 'tenant-123' };
            mockWarehouseService.create.mockResolvedValue(expectedResult);

            const result = await controller.create(dto);

            expect(mockWarehouseService.create).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findAll', () => {
        it('باید متد findAll سرویس را با فیلترها فراخوانی کند', async () => {
            const filterDto: FilterWarehouseDto = {
                page: 1,
                limit: 10,
            } as FilterWarehouseDto;

            const expectedResult = {
                items: [{ id: 'wh_1', code: 'WH-001' }],
                total: 1,
                page: 1,
            };
            mockWarehouseService.findAll.mockResolvedValue(expectedResult);

            const result = await controller.findAll(filterDto);

            expect(mockWarehouseService.findAll).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.findAll).toHaveBeenCalledWith(filterDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findOne', () => {
        it('باید متد findOne سرویس را با پارامتر id صدا بزند', async () => {
            const params: ParamIdDto = { id: 'wh_1' };
            const expectedResult = { id: 'wh_1', code: 'WH-001', name: 'انبار مرکزی' };

            mockWarehouseService.findOne.mockResolvedValue(expectedResult);

            const result = await controller.findOne(params);

            expect(mockWarehouseService.findOne).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.findOne).toHaveBeenCalledWith(params);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('update', () => {
        it('باید متد update سرویس را با پارامتر id و بدنه DTO فراخوانی کند', async () => {
            const params: ParamIdDto = { id: 'wh_1' };
            const updateDto: UpdateWarehouseDto = {
                name: 'انبار شماره یک (تغییر نام)',
            } as UpdateWarehouseDto;

            const expectedResult = { id: 'wh_1', code: 'WH-001', ...updateDto };
            mockWarehouseService.update.mockResolvedValue(expectedResult);

            const result = await controller.update(params, updateDto);

            expect(mockWarehouseService.update).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.update).toHaveBeenCalledWith(params, updateDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('delete', () => {
        it('باید متد delete سرویس را با پارامتر id صدا بزند', async () => {
            const params: ParamIdDto = { id: 'wh_1' };
            const expectedResult = { success: true, message: 'انبار با موفقیت حذف شد' };

            mockWarehouseService.delete.mockResolvedValue(expectedResult);

            const result = await controller.delete(params);

            expect(mockWarehouseService.delete).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.delete).toHaveBeenCalledWith(params);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('active', () => {
        it('باید متد active سرویس را برای فعال‌سازی انبار صدا بزند', async () => {
            const params: ParamIdDto = { id: 'wh_1' };
            const expectedResult = { id: 'wh_1', isActive: true };

            mockWarehouseService.active.mockResolvedValue(expectedResult);

            const result = await controller.active(params);

            expect(mockWarehouseService.active).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.active).toHaveBeenCalledWith(params);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('deActive', () => {
        it('باید متد deActive سرویس را برای غیرفعال‌سازی انبار صدا بزند', async () => {
            const params: ParamIdDto = { id: 'wh_1' };
            const expectedResult = { id: 'wh_1', isActive: false };

            mockWarehouseService.deActive.mockResolvedValue(expectedResult);

            const result = await controller.deActive(params);

            expect(mockWarehouseService.deActive).toHaveBeenCalledTimes(1);
            expect(mockWarehouseService.deActive).toHaveBeenCalledWith(params);
            expect(result).toEqual(expectedResult);
        });
    });
});