import { mysqlTable, char, varchar, timestamp, uniqueIndex, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { UsersSchema } from "./UsersSchema"
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';
import { getEnumValues } from '../../../common/utils/EnumUtils';

// 1. جدول مستأجرین (Tenants / Companies)
const tenantStatus = mysqlEnum('tenant_status', getEnumValues(TenantStatusEnum));
export const TenantsSchema = mysqlTable(
    'tenants',
    {
        id: char('id', { length: 26 }).primaryKey(), // UUID v4 / ULID
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull(), // برای ساب‌دامین یا شناسه یکتا
        status: tenantStatus.notNull().default(TenantStatusEnum.ACTIVE),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('tenants_slug_uq').on(table.slug),
    ]
);

// روابط Drizzle Relations
export const tenantsRelations = relations(TenantsSchema, ({ many }) => ({
    users: many(UsersSchema),
}));