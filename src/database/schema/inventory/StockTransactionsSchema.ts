import { mysqlTable, char, decimal, timestamp, index, mysqlEnum, varchar } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { UsersSchema } from '../identity/UsersSchema';
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { StockTransactionTypeEnum } from '../../../enum/StockTransactionTypeEnum';
import { WarehousesSchema } from './WarehousesSchema';
import { ProductsSchema } from './ProductsSchema';

// تعریف Enum نوع تراکنش انبار
const stockTransactionType = mysqlEnum('stock_transaction_type', getEnumValues(StockTransactionTypeEnum));

export const StockTransactionsSchema = mysqlTable(
    'stock_transactions',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        warehouseId: char('warehouse_id', { length: 26 })
            .notNull()
            .references(() => WarehousesSchema.id, { onDelete: 'restrict' }),
        productId: char('product_id', { length: 26 })
            .notNull()
            .references(() => ProductsSchema.id, { onDelete: 'restrict' }),
        createdByUserId: char('created_by_user_id', { length: 26 })
            .references(() => UsersSchema.id, { onDelete: 'set null' }),
        type: stockTransactionType.notNull().default(StockTransactionTypeEnum.ADJUST),
        quantity: decimal('quantity', { precision: 12, scale: 4 }).notNull(),
        balanceAfter: decimal('balance_after', { precision: 12, scale: 4 }).notNull(),
        referenceType: varchar('reference_type', { length: 50 }), // نوع سند ارجاعی (اختیاری)
        referenceId: char('reference_id', { length: 26 }), // شناسه سند ارجاعی (اختیاری)
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        // ایندکس ترکیبی برای جستجوی سریع کاردکس بر اساس تاریخ
        index('stock_transactions_history_idx').on(
            table.tenantId,
            table.warehouseId,
            table.productId,
            table.createdAt
        ),
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
    createdByUser: one(UsersSchema, {
        fields: [StockTransactionsSchema.createdByUserId],
        references: [UsersSchema.id],
    }),
}));