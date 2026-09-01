import { boolean, mysqlTable, char, decimal, timestamp, uniqueIndex, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { ProductCategoriesSchema } from './ProductCategoriesSchema';
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { ProductUnitEnum } from '../../../enum/ProductUnitEnum';
import { StockTransactionTypeEnum } from '../../../enum/StockTransactionTypeEnum';
import { WarehousesSchema } from './WarehousesSchema';
import { ProductsSchema } from './ProductsSchema';

// 1. جدول کالا (StockTransactions)
const stockTransactionType = mysqlEnum('stock_transaction_type', getEnumValues(StockTransactionTypeEnum));
export const StockTransactionsSchema = mysqlTable(
    'products',
    {
        id: char('id', { length: 26 }).primaryKey(), // UUID v4 / ULID
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        warehouseId: char('warehouse_id', { length: 26 })
            .notNull()
            .references(() => WarehousesSchema.id, { onDelete: 'cascade' }),
        productId: char('product_id', { length: 26 })
            .notNull()
            .references(() => ProductsSchema.id, { onDelete: 'cascade' }),
        type: stockTransactionType.notNull().default(StockTransactionTypeEnum.ADJUST),
        quantity: decimal('on_hand_quantity').notNull(),
        balanceAfter: decimal('balance_after').notNull(),
        referenceId: char('reference_id', { length: 26 })
            .notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('stock_transactions_tenant_warehouse_product_uq').on(table.tenantId, table.warehouseId, table.productId),
    ]
);

// روابط Drizzle Relations
export const stockTransactionRelations = relations(StockTransactionsSchema, ({ one }) => ({
    tenant: one(TenantsSchema, {
        fields: [StockTransactionsSchema.tenantId],
        references: [TenantsSchema.id],
    }),
    warehouse: one(WarehousesSchema, {
        fields: [StockTransactionsSchema.warehouseId],
        references: [WarehousesSchema.id],
    }),
    product: one(ProductsSchema, {
        fields: [StockTransactionsSchema.productId],
        references: [ProductsSchema.id],
    }),
}));