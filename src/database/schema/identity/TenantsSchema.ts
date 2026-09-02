import { mysqlTable, char, varchar, timestamp, uniqueIndex, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { UsersSchema } from "./UsersSchema"
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { productCategoriesRelations, ProductCategoriesSchema } from '../inventory/ProductCategoriesSchema';
import { ProductsSchema } from '../inventory/ProductsSchema';
import { warehouseRelations, WarehousesSchema } from '../inventory/WarehousesSchema';
import { InventorySchema } from '../inventory/InventorySchema';
import { stockTransactionRelations, StockTransactionsSchema } from '../inventory/StockTransactionsSchema';
import { CustomersSchema } from '../sales/CustomersSchema';
import { PriceListsSchema } from '../sales/PriceListsSchema';
import { PriceListItemsSchema } from '../sales/PriceListItemsSchema';

// 1. جدول مستأجرین (Tenants / Companies)
const tenantStatus = mysqlEnum('tenant_status', getEnumValues(TenantStatusEnum));
export const TenantsSchema = mysqlTable(
    'tenants',
    {
        id: char('id', { length: 26 }).primaryKey(), // UUID v4 / ULID
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull(), // برای ساب‌دامین یا شناسه یکتا
        status: tenantStatus.notNull().default(TenantStatusEnum.ACTIVE),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('tenants_slug_uq').on(table.slug),
    ]
);

// روابط Drizzle Relations
export const tenantsRelations = relations(TenantsSchema, ({ many }) => ({
    users: many(UsersSchema),
    productCategories: many(ProductCategoriesSchema),
    products: many(ProductsSchema),
    warehouses: many(WarehousesSchema),
    invetory: many(InventorySchema),
    stockTransactions: many(StockTransactionsSchema),
    customers: many(CustomersSchema),
    priceLists: many(PriceListsSchema),
    priceListItems: many(PriceListItemsSchema)
}));