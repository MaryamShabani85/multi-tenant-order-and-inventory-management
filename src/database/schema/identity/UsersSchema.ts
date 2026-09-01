import { mysqlTable, char, varchar, boolean, timestamp, index, uniqueIndex, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { TenantsSchema } from "./TenantsSchema"
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { UserRoleEnum } from '../../../enum/UserRoleEnum';

// 1. جدول کاربران درون سازمانی هر مستأجر (Users)
export const userRoleEnum = mysqlEnum('user_role', getEnumValues(UserRoleEnum));

export const UsersSchema = mysqlTable(
    'users',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'cascade' }),
        email: varchar('email', { length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        fullName: varchar('full_name', { length: 150 }).notNull(),
        role: userRoleEnum.notNull().default(UserRoleEnum.READ_ONLY),
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
export const usersRelations = relations(UsersSchema, ({ one }) => ({
    tenant: one(TenantsSchema, {
        fields: [UsersSchema.tenantId],
        references: [TenantsSchema.id],
    }),
}));