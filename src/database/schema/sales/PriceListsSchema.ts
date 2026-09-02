import
{
    boolean,
    char,
    mysqlTable,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { PriceListItemsSchema } from './PriceListItemsSchema';
import { CustomersSchema } from './CustomersSchema';

// جدول لیست‌های قیمت
export const PriceListsSchema = mysqlTable(
    'price_lists',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 255 }).notNull(),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('price_lists_tenant_name_uq').on(
            table.tenantId,
            table.name,
        ),
    ],
);

export const priceListRelations = relations(
    PriceListsSchema,
    ({ one, many }) => ({
        tenant: one(TenantsSchema, {
            fields: [PriceListsSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        customers: many(CustomersSchema),
        priceListItems: many(PriceListItemsSchema),
    }),
);
