import
{
    bigint,
    decimal,
    boolean,
    char,
    mysqlTable,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { check } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { CustomersSchema } from './CustomersSchema';
import { ProductsSchema } from '../inventory/ProductsSchema';

// جدول لیست‌های قیمت
export const CustomerCustomPricesSchema = mysqlTable(
    'customer_custom_prices',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        customerId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        productId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        customPrice: bigint('custom_price', { mode: 'bigint' }).notNull(),
        minQuantity: decimal('min_quantity', {
            precision: 12,
            scale: 4,
        })
            .notNull()
            .default('1'),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('customer_custom_prices_tenant_customer_product_uq').on(
            table.tenantId,
            table.customerId,
            table.productId,
        ),
        check(
            'customer_custom_prices_custom_price_non_negative_chk',
            sql`${table.customPrice} >= 0`,
        ),
        check(
            'customer_custom_prices_min_quantity_positive_chk',
            sql`${table.minQuantity} > 0`,
        ),
    ],
);

export const customerCustomPricesRelations = relations(
    CustomerCustomPricesSchema,
    ({ one }) => ({
        tenant: one(TenantsSchema, {
            fields: [CustomerCustomPricesSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        customer: one(CustomersSchema, {
            fields: [CustomerCustomPricesSchema.tenantId],
            references: [CustomersSchema.id],
        }),
        product: one(ProductsSchema, {
            fields: [CustomerCustomPricesSchema.tenantId],
            references: [ProductsSchema.id],
        }),
    }),
);
