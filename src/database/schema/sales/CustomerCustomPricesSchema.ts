import
{
    bigint,
    decimal,
    boolean,
    char,
    mysqlTable,
    timestamp,
    uniqueIndex,
    check,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { CustomersSchema } from './CustomersSchema';
import { ProductsSchema } from '../inventory/ProductsSchema';

// جدول قیمت‌های اختصاصی مشتریان
export const CustomerCustomPricesSchema = mysqlTable(
    'customer_custom_prices',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        customerId: char('customer_id', { length: 26 }) // اصلاح نام ستون
            .notNull()
            .references(() => CustomersSchema.id, { onDelete: 'restrict' }), // اصلاح ارجاع
        productId: char('product_id', { length: 26 }) // اصلاح نام ستون
            .notNull()
            .references(() => ProductsSchema.id, { onDelete: 'restrict' }), // اصلاح ارجاع
        customPrice: bigint('custom_price', { mode: 'bigint' }).notNull(),
        minQuantity: decimal('min_quantity', {
            precision: 12,
            scale: 4,
        })
            .notNull()
            .default('1'),
        isActive: boolean('is_active').notNull().default(true),
        validFrom: timestamp('valid_from'),
        validTo: timestamp('valid_to'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
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

// روابط Drizzle Relations
export const customerCustomPricesRelations = relations(
    CustomerCustomPricesSchema,
    ({ one }) => ({
        tenant: one(TenantsSchema, {
            fields: [CustomerCustomPricesSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        customer: one(CustomersSchema, {
            fields: [CustomerCustomPricesSchema.customerId], // اصلاح فیلد رابط
            references: [CustomersSchema.id],
        }),
        product: one(ProductsSchema, {
            fields: [CustomerCustomPricesSchema.productId], // اصلاح فیلد رابط
            references: [ProductsSchema.id],
        }),
    }),
);
