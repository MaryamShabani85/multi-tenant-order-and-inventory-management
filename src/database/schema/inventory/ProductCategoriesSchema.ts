import { boolean, mysqlTable, char, varchar, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { ProductsSchema } from './ProductsSchema';

// 1. جدول دسته بندی کالا (ProductCategories)
export const ProductCategoriesSchema = mysqlTable(
    'productCategories',
    {
        id: char('id', { length: 26 }).primaryKey(), // UUID v4 / ULID
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        parentCategoryId: char('parent_category_id', { length: 26 })
            .references(() => ProductCategoriesSchema.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull(), // برای ساب‌دامین یا شناسه یکتا
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('productCategories_slug_uq').on(table.slug),
    ]
);

// روابط Drizzle Relations
export const productCategoriesRelations = relations(ProductCategoriesSchema, ({ many, one }) => ({
    products: many(ProductsSchema),
    tenant: one(TenantsSchema, {
        fields: [ProductCategoriesSchema.tenantId],
        references: [TenantsSchema.id],
    }),
    productCategory: one(ProductCategoriesSchema, {
        fields: [ProductCategoriesSchema.parentCategoryId],
        references: [ProductCategoriesSchema.id],
    }),
}));