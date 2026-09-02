import { boolean, mysqlTable, char, varchar, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { ProductsSchema } from './ProductsSchema';

// 1. جدول دسته بندی کالا (ProductCategories)
export const ProductCategoriesSchema = mysqlTable(
    'product_categories',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        parentCategoryId: char('parent_category_id', { length: 26 })
            .references(() => ProductCategoriesSchema.id, { onDelete: 'restrict' }),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull(),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        uniqueIndex('product_categories_tenant_slug_uq').on(table.tenantId, table.slug),
    ]
);

// روابط Drizzle Relations
export const productCategoriesRelations = relations(ProductCategoriesSchema, ({ many, one }) => ({
    products: many(ProductsSchema),
    parentCategory: one(ProductCategoriesSchema, {
        fields: [ProductCategoriesSchema.parentCategoryId],
        references: [ProductCategoriesSchema.id],
        relationName: 'category_hierarchy',
    }),
    subCategories: many(ProductCategoriesSchema, {
        relationName: 'category_hierarchy',
    }),
    tenant: one(TenantsSchema, {
        fields: [ProductCategoriesSchema.tenantId],
        references: [TenantsSchema.id],
    }),
}));
