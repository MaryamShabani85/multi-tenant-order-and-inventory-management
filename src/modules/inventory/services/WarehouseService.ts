import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../../database/schema/ShemaRegistry";
import { DRIZZLE_PROVIDER } from "../../../database/DrizzleProvider";
import { CreateWarehouseDto } from "../dto/CreateWarehouseDto";
import { ulid } from "ulid";
import { and, eq, isNull, like, ne } from "drizzle-orm";
import { FilterWarehouseDto } from "../dto/FilterWarehouseDto";
import { ParamIdDto } from "../../../common/dto/ParamIdDto";
import { UpdateWarehouseDto } from "../dto/UpdateWarehouseDto";
import { TenantContextService } from "../../../core/tenant/TenantContextService";

@Injectable()
export class WarehouseService {
    constructor(
        @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database<typeof schema>,
        private readonly tenantContext: TenantContextService,
    ) { }

    async create(warehouse: CreateWarehouseDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;
        // ۱. بررسی یکتا بودن کد در سطح تننت (حتی انبارهای حذف‌شده)
        const existingWarehouse = await this.db.query.WarehousesSchema.findFirst({
            where: and(
                eq(warehouses.tenantId, tenantId),
                eq(warehouses.code, warehouse.code),
            )
        });
        if (existingWarehouse) {
            throw new ConflictException('کد انبار قبلاً ثبت شده است.');
        }

        const warehouseId = ulid();

        await this.db.insert(warehouses).values({
            id: warehouseId,
            tenantId,
            code: warehouse.code,
            name: warehouse.name,
            address: warehouse.address,
            isActive: true
        });

        return {
            message: 'ثبت‌ انبار با موفقیت انجام شد.',
            tenantId,
            warehouseId,
        };
    }

    async findAll(filter: FilterWarehouseDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;
        return await this.db.query.WarehousesSchema.findMany({
            where: and(
                eq(warehouses.tenantId, tenantId),
                isNull(warehouses.deletedAt),
                filter.code ? like(warehouses.code, `%${filter.code}%`) : undefined,
                filter.name ? like(warehouses.name, `%${filter.name}%`) : undefined,
                filter.address ? like(warehouses.address, `%${filter.address}%`) : undefined,
                filter.isActive !== undefined ? eq(warehouses.isActive, filter.isActive) : undefined,
            )
        });
    }

    async findOne(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;
        const warehouse = await this.db.query.WarehousesSchema.findFirst({
            where: and(
                eq(warehouses.tenantId, tenantId),
                eq(warehouses.id, id.id),
                isNull(warehouses.deletedAt),
            )
        });

        if (!warehouse) {
            throw new NotFoundException('انبار مورد نظر یافت نشد.');
        }

        return warehouse;
    }

    async update(id: ParamIdDto, warehouse: UpdateWarehouseDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;

        // بررسی وجود انبار زنده
        await this.findOne(id);

        // اگر کد در حال ویرایش است، مطمئن شویم به نام انبار دیگری نیست
        if (warehouse.code) {
            const duplicateCode = await this.db.query.WarehousesSchema.findFirst({
                where: and(
                    eq(warehouses.tenantId, tenantId),
                    eq(warehouses.code, warehouse.code),
                    ne(warehouses.id, id.id)
                )
            });
            if (duplicateCode) {
                throw new ConflictException('این کد انبار برای انبار دیگری استفاده شده است.');
            }
        }

        await this.db.update(warehouses).set({
            ...(warehouse.code && { code: warehouse.code }),
            ...(warehouse.name && { name: warehouse.name }),
            ...(warehouse.address && { address: warehouse.address }),
        }).where(and(
            eq(warehouses.tenantId, tenantId),
            eq(warehouses.id, id.id),
            isNull(warehouses.deletedAt),
        ));

        return {
            message: 'به‌روزرسانی انبار با موفقیت انجام شد.',
            tenantId,
            warehouseId: id.id,
        };
    }

    async delete(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;
        await this.findOne(id);

        await this.db.update(warehouses).set({
            deletedAt: new Date()
        }).where(and(
            eq(warehouses.tenantId, tenantId),
            eq(warehouses.id, id.id),
            isNull(warehouses.deletedAt),
        ));

        return {
            message: 'حذف انبار با موفقیت انجام شد.',
            tenantId,
            warehouseId: id.id,
        };
    }

    async active(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;
        await this.findOne(id);

        await this.db.update(warehouses).set({
            isActive: true
        }).where(and(
            eq(warehouses.tenantId, tenantId),
            eq(warehouses.id, id.id),
            isNull(warehouses.deletedAt),
        ));

        return {
            message: 'انبار فعال شد.',
            tenantId,
            warehouseId: id.id,
        };
    }

    async deActive(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const warehouses = schema.WarehousesSchema;
        await this.findOne(id);

        await this.db.update(warehouses).set({
            isActive: false
        }).where(and(
            eq(warehouses.tenantId, tenantId),
            eq(warehouses.id, id.id),
            isNull(warehouses.deletedAt),
        ));

        return {
            message: 'انبار غیرفعال شد.',
            tenantId,
            warehouseId: id.id,
        };
    }
}
