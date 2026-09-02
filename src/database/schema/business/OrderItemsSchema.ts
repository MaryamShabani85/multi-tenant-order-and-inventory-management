import
{
    char,
    check,
    decimal,
    mysqlTable,
    timestamp,
    uniqueIndex,
    bigint,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { ProductsSchema } from '../inventory/ProductsSchema';
import { OrdersSchema } from './OrdersSchema';

// جدول اقلام سفارش
export const OrderItemsSchema = mysqlTable(
    'order_items',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        orderId: char('order_id', { length: 26 })
            .notNull()
            .references(() => OrdersSchema.id, { onDelete: 'restrict' }),
        productId: char('product_id', { length: 26 })
            .notNull()
            .references(() => ProductsSchema.id, { onDelete: 'restrict' }),
        quantity: decimal('quantity', { precision: 12, scale: 4 }).notNull(),
        unitPrice: bigint('unit_price', { mode: 'bigint' }).notNull(),
        totalPrice: bigint('total_price', { mode: 'bigint' }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        uniqueIndex('order_items_tenant_order_product_uq').on(
            table.tenantId,
            table.orderId,
            table.productId,
        ),
        check(
            'order_items_quantity_positive_chk',
            sql`${table.quantity} > 0`,
        ),
        check(
            'order_items_unit_price_non_negative_chk',
            sql`${table.unitPrice} >= 0`,
        ),
        check(
            'order_items_total_price_non_negative_chk',
            sql`${table.totalPrice} >= 0`,
        ),
    ],
);

export const orderItemRelations = relations(
    OrderItemsSchema,
    ({ one }) => ({
        tenant: one(TenantsSchema, {
            fields: [OrderItemsSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        order: one(OrdersSchema, {
            fields: [OrderItemsSchema.orderId],
            references: [OrdersSchema.id],
        }),
        product: one(ProductsSchema, {
            fields: [OrderItemsSchema.productId],
            references: [ProductsSchema.id],
        }),
    }),
);
