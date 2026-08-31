import { mysqlTable, char, varchar, boolean, timestamp, index, uniqueIndex, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// 1. جدول مستأجرین (Tenants / Companies)
export const tenantStatusEnum = mysqlEnum('tenant_status', ['ACTIVE', 'SUSPENDED', 'PENDING']);

export const tenants = mysqlTable(
    'tenants',
    {
        id: char('id', { length: 36 }).primaryKey(), // UUID v4 / ULID
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull(), // برای ساب‌دامین یا شناسه یکتا
        status: tenantStatusEnum.notNull().default('ACTIVE'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex('tenants_slug_uq').on(table.slug),
    ]
);

// 2. جدول کاربران درون سازمانی هر مستأجر (Users)
export const userRoleEnum = mysqlEnum('user_role', [
    'TENANT_ADMIN',
    'SALES_MANAGER',
    'WAREHOUSE_STAFF',
    'READ_ONLY',
]);

export const users = mysqlTable(
    'users',
    {
        id: char('id', { length: 36 }).primaryKey(),
        tenantId: char('tenant_id', { length: 36 })
            .notNull()
            .references(() => tenants.id, { onDelete: 'cascade' }),
        email: varchar('email', { length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        fullName: varchar('full_name', { length: 150 }).notNull(),
        role: userRoleEnum.notNull().default('READ_ONLY'),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        // ایمیل در سطح کل سیستم یا در سطح هر مستأجر یکتا باشد (در مدل SaaS ایزوله معمولاً ترکیب tenantId + email یکتاست)
        uniqueIndex('users_tenant_email_uq').on(table.tenantId, table.email),
        index('users_tenant_idx').on(table.tenantId),
    ]
);

// روابط Drizzle Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
    users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
    tenant: one(tenants, {
        fields: [users.tenantId],
        references: [tenants.id],
    }),
}));