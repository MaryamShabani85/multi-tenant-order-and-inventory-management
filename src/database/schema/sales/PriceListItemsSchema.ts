import
{
    bigint,
    char,
    check,
    decimal,
    mysqlTable,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { PriceListsSchema } from './PriceListsSchema';
import { ProductsSchema } from '../inventory/ProductsSchema';

// جدول اقلام لیست قیمت
export const PriceListItemsSchema = mysqlTable(
    'price_list_items',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        priceListId: char('price_list_id', { length: 26 })
            .notNull()
            .references(() => PriceListsSchema.id, {
                onDelete: 'cascade',
            }),
        productId: char('product_id', { length: 26 })
            .notNull()
            .references(() => ProductsSchema.id, {
                onDelete: 'cascade',
            }),

        // مبلغ صحیح بر حسب کوچک‌ترین واحد پولی، مثلاً ریال
        price: bigint('price', { mode: 'bigint' }).notNull(),

        // هماهنگ با دقت مقادیر انبار
        minOrderQuantity: decimal('min_order_quantity', {
            precision: 12,
            scale: 4,
        })
            .notNull()
            .default('1'),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex(
            'price_list_items_tenant_price_list_product_uq',
        ).on(
            table.tenantId,
            table.priceListId,
            table.productId,
        ),
        check(
            'price_list_items_price_non_negative_chk',
            sql`${table.price} >= 0`,
        ),
        check(
            'price_list_items_min_quantity_positive_chk',
            sql`${table.minOrderQuantity} > 0`,
        ),
    ],
);

export const priceListItemRelations = relations(
    PriceListItemsSchema,
    ({ one }) => ({
        tenant: one(TenantsSchema, {
            fields: [PriceListItemsSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        priceList: one(PriceListsSchema, {
            fields: [PriceListItemsSchema.priceListId],
            references: [PriceListsSchema.id],
        }),
        product: one(ProductsSchema, {
            fields: [PriceListItemsSchema.productId],
            references: [ProductsSchema.id],
        }),
    }),
);