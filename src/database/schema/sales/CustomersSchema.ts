import { boolean, bigint, int, mysqlTable, varchar, char, timestamp, uniqueIndex, check } from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { PriceListsSchema } from './PriceListsSchema';
import { customerCustomPricesRelations, CustomerCustomPricesSchema } from './CustomerCustomPricesSchema';
import { OrdersSchema } from '../business/OrdersSchema';

// 1. جدول مشتریان (Customers)
export const CustomersSchema = mysqlTable(
    'customers',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        companyName: varchar('company_name', { length: 255 }).notNull(),
        nationalId: varchar('national_id', { length: 11 }).notNull(),
        economicCode: varchar('economic_code', { length: 12 }),
        registrationNumber: varchar('registration_number', { length: 20 }),
        phone: char('phone', { length: 11 }).notNull(),
        email: varchar('email', { length: 50 }),
        website: varchar('website', { length: 100 }),
        postalCode: char('postal_code', { length: 10 }).notNull(),
        address: varchar('address', { length: 500 }).notNull(),
        defaultPriceListId: char('default_price_list_id', { length: 26 })
            .references(() => PriceListsSchema.id, { onDelete: 'set null' }),
        creditLimit: bigint('credit_limit', { mode: 'number' }).notNull().default(0),
        defaultPaymentTermDays: int('default_payment_term_days').notNull().default(0),
        currentBalance: bigint('current_balance', { mode: 'number' }).notNull().default(0),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        check('chk_phone_digits_start_zero', sql`${table.phone} REGEXP '^0[0-9]{10}$'`),
        check('chk_national_id_digits', sql`${table.nationalId} REGEXP '^[0-9]+$'`),
        check('chk_economic_code_digits', sql`${table.economicCode} IS NULL OR ${table.economicCode} REGEXP '^[0-9]+$'`),
        check('chk_postal_code_digits', sql`${table.postalCode} REGEXP '^[0-9]{10}$'`),
        uniqueIndex('customers_tenant_national_id_uq').on(table.tenantId, table.nationalId),
    ]
);

// روابط Drizzle Relations
export const customerRelations = relations(CustomersSchema, ({ one, many }) => ({
    tenant: one(TenantsSchema, {
        fields: [CustomersSchema.tenantId],
        references: [TenantsSchema.id],
    }),
    priceList: one(PriceListsSchema, {
        fields: [CustomersSchema.defaultPriceListId],
        references: [PriceListsSchema.id],
    }),
    customerCustomPrices: many(CustomerCustomPricesSchema),
    orders: many(OrdersSchema)
}));