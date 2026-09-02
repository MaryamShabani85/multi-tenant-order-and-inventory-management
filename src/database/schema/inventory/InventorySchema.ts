import { decimal, mysqlTable, char, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { ProductsSchema } from './ProductsSchema';
import { WarehousesSchema } from './WarehousesSchema';

// 1. جدول موجودی کالا (Inventory)
export const InventorySchema = mysqlTable(
    'inventory',
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
        onHandQuantity: decimal('on_hand_quantity', { precision: 12, scale: 4 }).notNull().default('0'),
        reservedQuantity: decimal('reserved_quantity', { precision: 12, scale: 4 }).notNull().default('0'),
        reorderPoint: decimal('reorder_point', { precision: 12, scale: 4 }).notNull().default('0'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        uniqueIndex('inventory_tenant_warehouse_product_uq').on(table.tenantId, table.warehouseId, table.productId),
    ]
);

// روابط Drizzle Relations
export const inventoryRelations = relations(InventorySchema, ({ one }) => ({
    tenant: one(TenantsSchema, {
        fields: [InventorySchema.tenantId],
        references: [TenantsSchema.id],
    }),
    warehouse: one(WarehousesSchema, {
        fields: [InventorySchema.warehouseId],
        references: [WarehousesSchema.id],
    }),
    product: one(ProductsSchema, {
        fields: [InventorySchema.productId],
        references: [ProductsSchema.id],
    }),
}));