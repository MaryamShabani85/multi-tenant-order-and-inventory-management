import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WarehouseService } from './WarehouseService';
import { ParamIdDto } from '../../../../common/dto/ParamIdDto';
import { DRIZZLE_PROVIDER } from '../../../../database/DrizzleProvider';
import { TenantContextService } from '../../../../core/tenant/TenantContextService';

describe('WarehouseService', () => {
    let warehouseService: WarehouseService;

    // شبیه‌سازی زنجیره‌ای برای کلاینت Drizzle
    const mockDb = {
        query: {
            WarehousesSchema: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
        },
        insert: jest.fn().mockReturnValue({
            values: jest.fn().mockResolvedValue([{ id: 'wh_new_id' }]),
        }),
        update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([{ id: 'warehouse_id' }]),
            }),
        }),
        delete: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(undefined),
        }),
    };

    const mockTenantContext = {
        getTenantId: jest.fn().mockReturnValue('tenant-123'),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WarehouseService,
                {
                    provide: DRIZZLE_PROVIDER,
                    useValue: mockDb,
                },
                {
                    provide: TenantContextService,
                    useValue: mockTenantContext,
                },
            ],
        }).compile();

        warehouseService = module.get<WarehouseService>(WarehouseService);
    });

    it('باید سرویس انبار بدون خطا اینجکت و ایجاد شود', () => {
        expect(warehouseService).toBeDefined();
    });

    describe('create', () => {
        const mockCreateWarehouseDto = {
            code: '1_123',
            name: 'انبار مرکزی شماره یک',
            address: 'تهران، شهرک صنعتی',
        };

        it('اگر کد انبار در این تنانت تکراری باشد باید ConflictException پرتاب کند', async () => {
            // شبیه‌سازی: انباری با این کد در تنانت پیدا شد
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue({
                id: 'existing_wh_id',
                code: mockCreateWarehouseDto.code,
                tenantId: 'tenant-123',
            });

            await expect(warehouseService.create(mockCreateWarehouseDto)).rejects.toThrow(
                ConflictException,
            );
        });

        it('باید ثبت انبار جدید را با موفقیت انجام دهد', async () => {
            // شبیه‌سازی: کدی با این عنوان قبلاً وجود ندارد
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(null);

            const result = await warehouseService.create(mockCreateWarehouseDto);

            expect(mockDb.insert).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });
    });

    describe('findOne', () => {
        const paramId: ParamIdDto = { id: 'warehouse_id' };

        it('اگر انبار پیدا نشود باید NotFoundException پرتاب کند', async () => {
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(null);

            await expect(warehouseService.findOne(paramId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('اگر انبار وجود داشته باشد باید اطلاعات آن را برگرداند', async () => {
            const expectedWarehouse = {
                id: paramId.id,
                code: '1_123',
                name: 'انبار مرکزی',
                tenantId: 'tenant-123',
            };
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(expectedWarehouse);

            const result = await warehouseService.findOne(paramId);

            expect(result).toEqual(expectedWarehouse);
        });
    });

    describe('update', () => {
        const paramId: ParamIdDto = { id: 'warehouse_id' };
        const mockUpdateWarehouseDto = {
            code: '2_123',
            name: 'انبار مرکزی تغییر یافته',
        };

        it('اگر انبار مورد نظر برای ویرایش وجود نداشته باشد باید NotFoundException پرتاب کند', async () => {
            // کوئری اول برای چک کردن وجود انبار اصلی نتیجه‌ای ندارد
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(null);

            await expect(warehouseService.update(paramId, mockUpdateWarehouseDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('اگر کد جدید انبار متعلق به انبار دیگری باشد باید ConflictException پرتاب کند', async () => {
            // انبار فعلی پیدا می‌شود، اما چک کد جدید نشان می‌دهد انبار دیگری با این کد هست
            mockDb.query.WarehousesSchema.findFirst
                .mockResolvedValueOnce({ id: paramId.id, code: '1_123' }) // فراخوانی اول: پیدا کردن خود رکورد
                .mockResolvedValueOnce({ id: 'different_warehouse_id', code: '2_123' }); // فراخوانی دوم: تکراری بودن کد در انبار دیگر

            await expect(warehouseService.update(paramId, mockUpdateWarehouseDto)).rejects.toThrow(
                ConflictException,
            );
        });

        it('باید ویرایش انبار را با موفقیت اجرا کند', async () => {
            mockDb.query.WarehousesSchema.findFirst
                .mockResolvedValueOnce({ id: paramId.id, code: '1_123' }) // خود رکورد هست
                .mockResolvedValueOnce(null); // کد جدید در انبار دیگری نیست

            const result = await warehouseService.update(paramId, mockUpdateWarehouseDto);

            expect(mockDb.update).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });
    });

    describe('delete', () => {
        const paramId: ParamIdDto = { id: 'warehouse_id' };

        it('اگر انبار برای حذف یافت نشود باید NotFoundException پرتاب کند', async () => {
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(null);

            await expect(warehouseService.delete(paramId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('باید عملیات حذف را با موفقیت انجام دهد', async () => {
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue({
                id: paramId.id,
                name: 'انبار تست',
            });

            const result = await warehouseService.delete(paramId);

            expect(result).toBeDefined();
        });
    });
    describe('active', () => {
        const paramId: ParamIdDto = { id: 'warehouse_id' };

        it('اگر انبار پیدا نشود باید NotFoundException پرتاب کند', async () => {
            // شبیه‌سازی: انبار در این تنانت پیدا نشد
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(null);

            await expect(warehouseService.active(paramId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('باید انبار را فعال کند و وضعیت جدید را برگرداند', async () => {
            const existingWarehouse = {
                id: paramId.id,
                name: 'انبار مرکزی',
                isActive: false,
                tenantId: 'tenant-123',
            };

            // مرحله اول: پیدا شدن انبار
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(existingWarehouse);

            // مرحله دوم: نتیجه آپدیت دیتابیس
            const updatedWarehouse = { ...existingWarehouse, isActive: true };
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([updatedWarehouse]),
                }),
            });

            const result = await warehouseService.active(paramId);

            expect(mockDb.update).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });
    });

    describe('deActive', () => {
        const paramId: ParamIdDto = { id: 'warehouse_id' };

        it('اگر انبار پیدا نشود باید NotFoundException پرتاب کند', async () => {
            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(null);

            await expect(warehouseService.deActive(paramId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('باید انبار را غیرفعال کند و وضعیت جدید را برگرداند', async () => {
            const existingWarehouse = {
                id: paramId.id,
                name: 'انبار مرکزی',
                isActive: true,
                tenantId: 'tenant-123',
            };

            mockDb.query.WarehousesSchema.findFirst.mockResolvedValue(existingWarehouse);

            const updatedWarehouse = { ...existingWarehouse, isActive: false };
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([updatedWarehouse]),
                }),
            });

            const result = await warehouseService.deActive(paramId);

            expect(mockDb.update).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });
    });
});