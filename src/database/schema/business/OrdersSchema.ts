import
{
    boolean,
    char,
    varchar,
    check,
    int,
    mysqlTable,
    timestamp,
    index,
    uniqueIndex,
    bigint,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { WarehousesSchema } from '../inventory/WarehousesSchema';
import { CustomersSchema } from '../sales/CustomersSchema';
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { OrderStatusEnum } from '../../../enum/OrderStatusEnum';
import { UsersSchema } from '../identity/UsersSchema';
import { OrderItemsSchema } from './OrderItemsSchema';

const orderStatus = mysqlEnum('order_status', getEnumValues(OrderStatusEnum));

// جدول سربرگ سفارشات
export const OrdersSchema = mysqlTable(
    'orders',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),

        // جلوگیری از حذف فیزیکی انبار در صورت داشتن سفارش
        warehouseId: char('warehouse_id', { length: 26 })
            .notNull()
            .references(() => WarehousesSchema.id, { onDelete: 'restrict' }),

        customerId: char('customer_id', { length: 26 })
            .notNull()
            .references(() => CustomersSchema.id, { onDelete: 'restrict' }),

        orderNumber: int('order_number').notNull(),

        orderStatus: orderStatus.notNull().default(OrderStatusEnum.PENDING),

        totalAmount: bigint('total_amount', { mode: 'bigint' }).notNull(),

        createdByUserId: char('created_by_user_id', { length: 26 })
            .references(() => UsersSchema.id, { onDelete: 'set null' }),

        shippingAddress: varchar('shipping_address', { length: 500 }).notNull(),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        uniqueIndex('orders_tenant_order_number_uq').on(
            table.tenantId,
            table.orderNumber,
        ),
        // ایندکس جهت فیلتر و گزارش‌گیری سفارشات مشتری
        index('orders_tenant_customer_created_idx').on(
            table.tenantId,
            table.customerId,
            table.createdAt,
        ),
        // ایندکس جهت فیلتر کارتابل سفارشات بر اساس وضعیت (برای پنل ادمین/انبار)
        index('orders_tenant_status_created_idx').on(
            table.tenantId,
            table.orderStatus,
            table.createdAt,
        ),
        check(
            'order_price_non_negative_chk',
            sql`${table.totalAmount} >= 0`,
        ),
    ],
);

export const orderRelations = relations(
    OrdersSchema,
    ({ one, many }) => ({
        orderItems: many(OrderItemsSchema),
        tenant: one(TenantsSchema, {
            fields: [OrdersSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        warehouse: one(WarehousesSchema, {
            fields: [OrdersSchema.warehouseId],
            references: [WarehousesSchema.id],
        }),
        customer: one(CustomersSchema, {
            fields: [OrdersSchema.customerId],
            references: [CustomersSchema.id],
        }),
        createdByUser: one(UsersSchema, {
            fields: [OrdersSchema.createdByUserId],
            references: [UsersSchema.id],
        }),
    }),
);