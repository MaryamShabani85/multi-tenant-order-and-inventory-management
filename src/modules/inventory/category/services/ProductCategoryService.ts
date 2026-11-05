import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../../../database/schema/ShemaRegistry";
import { DRIZZLE_PROVIDER } from "../../../../database/DrizzleProvider";
import { ulid } from "ulid";
import { and, eq, isNull, ne } from "drizzle-orm";
import { ParamIdDto } from "../../../../common/dto/ParamIdDto";
import { TenantContextService } from "../../../../core/tenant/TenantContextService";
import { CreateProductCategoryDto } from "../dto/CreateProductCategoryDto";
import { UpdateProductCategoryDto } from "../dto/UpdateProductCategoryDto";

@Injectable()
export class ProductCategoryService {
    constructor(
        @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database<typeof schema>,
        private readonly tenantContext: TenantContextService,
    ) { }

    async create(productCategory: CreateProductCategoryDto) {
        const tenantId = this.tenantContext.getTenantId();
        const productCategories = schema.ProductCategoriesSchema;
        // ۱. بررسی یکتا بودن شناسه دسته بندی کالاها در سطح تننت (حتی دسته بندی های حذف‌شده)
        const existingProductCategory = await this.db.query.ProductCategoriesSchema.findFirst({
            where: and(
                eq(productCategories.tenantId, tenantId),
                eq(productCategories.slug, productCategory.slug),
            )
        });
        if (existingProductCategory) {
            throw new ConflictException('شناسه دسته بندی قبلاً ثبت شده است.');
        }

        if (productCategory.parentCategoryId) {
            const existingParentCategory = await this.db.query.ProductCategoriesSchema.findFirst({
                where: and(
                    eq(productCategories.tenantId, tenantId),
                    eq(productCategories.id, productCategory.parentCategoryId),
                )
            });
            if (!existingParentCategory) {
                throw new ConflictException('دسته بندی پدر یافت نشد.');
            }
        }

        const productCategoryId = ulid();

        await this.db.insert(productCategories).values({
            id: productCategoryId,
            tenantId,
            parentCategoryId: productCategory.parentCategoryId,
            slug: productCategory.slug,
            name: productCategory.name,
            isActive: true
        });

        return {
            message: 'ثبت‌ دسته بندی با موفقیت انجام شد.',
            tenantId,
            productCategoryId,
        };
    }

    async findOne(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const productCategories = schema.ProductCategoriesSchema;
        const productCategory = await this.db.query.ProductCategoriesSchema.findFirst({
            where: and(
                eq(productCategories.tenantId, tenantId),
                eq(productCategories.id, id.id),
                isNull(productCategories.deletedAt),
            )
        });

        if (!productCategory) {
            throw new NotFoundException('دسته بندی مورد نظر یافت نشد.');
        }

        return productCategory;
    }

    async update(id: ParamIdDto, productCategory: UpdateProductCategoryDto) {
        const tenantId = this.tenantContext.getTenantId();
        const productCategories = schema.ProductCategoriesSchema;

        // بررسی وجود دسته بندی زنده
        await this.findOne(id);

        // اگر شناسه در حال ویرایش است، مطمئن شویم به نام دسته بندی دیگری نیست
        if (productCategory.slug) {
            const duplicateCode = await this.db.query.ProductCategoriesSchema.findFirst({
                where: and(
                    eq(productCategories.tenantId, tenantId),
                    eq(productCategories.slug, productCategory.slug),
                    ne(productCategories.id, id.id)
                )
            });
            if (duplicateCode) {
                throw new ConflictException('این شناسه دسته بندی برای دسته بندی دیگری استفاده شده است.');
            }
        }

        if (productCategory.parentCategoryId) {
            const existingParentCategory = await this.db.query.ProductCategoriesSchema.findFirst({
                where: and(
                    eq(productCategories.tenantId, tenantId),
                    eq(productCategories.id, productCategory.parentCategoryId),
                )
            });
            if (!existingParentCategory) {
                throw new ConflictException('دسته بندی پدر یافت نشد.');
            }
        }

        await this.db.update(productCategories).set({
            ...(productCategory.slug && { slug: productCategory.slug }),
            ...(productCategory.name && { name: productCategory.name }),
            ...(productCategory.parentCategoryId && { parentCategoryId: productCategory.parentCategoryId }),
        }).where(and(
            eq(productCategories.tenantId, tenantId),
            eq(productCategories.id, id.id),
            isNull(productCategories.deletedAt),
        ));

        return {
            message: 'به‌روزرسانی دسته بندی با موفقیت انجام شد.',
            tenantId,
            productCategoryId: id.id,
        };
    }

    async delete(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const productCategories = schema.ProductCategoriesSchema;
        await this.findOne(id);

        await this.db.update(productCategories).set({
            deletedAt: new Date()
        }).where(and(
            eq(productCategories.tenantId, tenantId),
            eq(productCategories.id, id.id),
            isNull(productCategories.deletedAt),
        ));

        return {
            message: 'حذف دسته بندی با موفقیت انجام شد.',
            tenantId,
            productCategoryId: id.id,
        };
    }

    async active(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const productCategories = schema.ProductCategoriesSchema;
        await this.findOne(id);

        await this.db.update(productCategories).set({
            isActive: true
        }).where(and(
            eq(productCategories.tenantId, tenantId),
            eq(productCategories.id, id.id),
            isNull(productCategories.deletedAt),
        ));

        return {
            message: 'دسته بندی فعال شد.',
            tenantId,
            productCategoryId: id.id,
        };
    }

    async deActive(id: ParamIdDto) {
        const tenantId = this.tenantContext.getTenantId();
        const productCategories = schema.ProductCategoriesSchema;
        await this.findOne(id);

        await this.db.update(productCategories).set({
            isActive: false
        }).where(and(
            eq(productCategories.tenantId, tenantId),
            eq(productCategories.id, id.id),
            isNull(productCategories.deletedAt),
        ));

        return {
            message: 'دسته بندی غیرفعال شد.',
            tenantId,
            productCategoryId: id.id,
        };
    }
}
