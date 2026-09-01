import { boolean, mysqlTable, char, varchar, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';

// 1. جدول انبار (Warehouses)
export const WarehousesSchema = mysqlTable(
    'products',
    {
        id: char('id', { length: 26 }).primaryKey(), // UUID v4 / ULID
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        code: varchar('code', { length: 20 }).notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('warehouses_code_uq').on(table.code),
    ]
);

// روابط Drizzle Relations
export const warehouseRelations = relations(WarehousesSchema, ({ one }) => ({
    tenant: one(TenantsSchema, {
        fields: [WarehousesSchema.tenantId],
        references: [TenantsSchema.id],
    }),
}));