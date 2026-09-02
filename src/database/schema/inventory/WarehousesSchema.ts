import { boolean, mysqlTable, char, varchar, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { InventorySchema } from './InventorySchema';
import { StockTransactionsSchema } from './StockTransactionsSchema';
import { OrdersSchema } from '../business/OrdersSchema';

// 1. جدول انبار (Warehouses)
export const WarehousesSchema = mysqlTable(
    'warehouses',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        code: varchar('code', { length: 20 }).notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        address: varchar('address', { length: 500 }).notNull(),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        uniqueIndex('warehouses_tenant_code_uq').on(table.tenantId, table.code),
    ]
);

// روابط Drizzle Relations
export const warehouseRelations = relations(WarehousesSchema, ({ one, many }) => ({
    tenant: one(TenantsSchema, {
        fields: [WarehousesSchema.tenantId],
        references: [TenantsSchema.id],
    }),
    inventory: many(InventorySchema),
    stockTransactions: many(StockTransactionsSchema),
    orders: many(OrdersSchema)
}));