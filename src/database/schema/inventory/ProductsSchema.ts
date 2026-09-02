import { boolean, mysqlTable, char, varchar, timestamp, uniqueIndex, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { ProductCategoriesSchema } from './ProductCategoriesSchema';
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { ProductUnitEnum } from '../../../enum/ProductUnitEnum';
import { InventorySchema } from './InventorySchema';
import { StockTransactionsSchema } from './StockTransactionsSchema';
import { CustomerCustomPricesSchema } from '../sales/CustomerCustomPricesSchema';

// 1. جدول کالا (Products)
const productUnit = mysqlEnum('product_unit', getEnumValues(ProductUnitEnum));
export const ProductsSchema = mysqlTable(
    'products',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        productCategoryId: char('product_category_id', { length: 26 })
            .notNull()
            .references(() => ProductCategoriesSchema.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 255 }).notNull(),
        sku: varchar('sku', { length: 100 }).notNull(),
        barcode: varchar('barcode', { length: 50 }), // در صورت نیاز nullable
        isActive: boolean('is_active').notNull().default(true),
        unit: productUnit.notNull().default(ProductUnitEnum.PCS),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('products_tenant_sku_uq').on(table.tenantId, table.sku),
    ]
);

// روابط Drizzle Relations
export const productRelations = relations(ProductsSchema, ({ one, many }) => ({
    tenant: one(TenantsSchema, {
        fields: [ProductsSchema.tenantId],
        references: [TenantsSchema.id],
    }),
    productCategory: one(ProductCategoriesSchema, {
        fields: [ProductsSchema.productCategoryId],
        references: [ProductCategoriesSchema.id],
    }),
    inventory: many(InventorySchema),
    stockTransactions: many(StockTransactionsSchema),
    customerCustomPrices: many(CustomerCustomPricesSchema),
}));