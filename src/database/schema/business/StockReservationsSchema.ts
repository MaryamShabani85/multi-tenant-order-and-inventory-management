import
{
    mysqlTable,
    char,
    decimal,
    timestamp,
    index,
    mysqlEnum,
    check,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import { TenantsSchema } from '../identity/TenantsSchema';
import { getEnumValues } from '../../../common/utils/EnumUtils';
import { StockReservationStatusEnum } from '../../../enum/StockReservationStatusEnum';
import { OrdersSchema } from './OrdersSchema';
import { WarehousesSchema } from '../inventory/WarehousesSchema';
import { ProductsSchema } from '../inventory/ProductsSchema';

// تعریف Enum وضعیت رزرو
const stockReservationStatus = mysqlEnum(
    'stock_reservation_status',
    getEnumValues(StockReservationStatusEnum),
);

// جدول رزرو موجودی کالاها
export const StockReservationsSchema = mysqlTable(
    'stock_reservations',
    {
        id: char('id', { length: 26 }).primaryKey(),
        tenantId: char('tenant_id', { length: 26 })
            .notNull()
            .references(() => TenantsSchema.id, { onDelete: 'restrict' }),
        orderId: char('order_id', { length: 26 })
            .notNull()
            .references(() => OrdersSchema.id, { onDelete: 'restrict' }),

        // اصلاح به restrict برای حفظ یکپارچگی داده‌های انبار و کالا
        warehouseId: char('warehouse_id', { length: 26 })
            .notNull()
            .references(() => WarehousesSchema.id, { onDelete: 'restrict' }),
        productId: char('product_id', { length: 26 })
            .notNull()
            .references(() => ProductsSchema.id, { onDelete: 'restrict' }),

        quantity: decimal('quantity', { precision: 12, scale: 4 }).notNull(),
        status: stockReservationStatus
            .notNull()
            .default(StockReservationStatusEnum.ACTIVE),

        // حذف defaultNow تا زمان انقضا دقیقاً توسط سرویس ثبت شود
        expireAt: timestamp('expire_at').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => [
        // ۱. ایندکس سریع برای محاسبه موجودی فعال/رزرو شده کالا در انبار
        index('stock_res_tenant_wh_prod_status_idx').on(
            table.tenantId,
            table.warehouseId,
            table.productId,
            table.status,
        ),
        // ۲. ایندکس بهینه برای جاب پس‌زمینه (Cron Job) جهت آزادسازی رزروهای منقضی‌شده
        index('stock_res_status_expire_idx').on(
            table.status,
            table.expireAt,
        ),
        // ۳. اطمینان از مثبت بودن مقدار رزرو
        check(
            'stock_reservations_quantity_positive_chk',
            sql`${table.quantity} > 0`,
        ),
    ],
);

// روابط Drizzle Relations
export const stockReservationRelations = relations(
    StockReservationsSchema,
    ({ one }) => ({
        tenant: one(TenantsSchema, {
            fields: [StockReservationsSchema.tenantId],
            references: [TenantsSchema.id],
        }),
        order: one(OrdersSchema, {
            fields: [StockReservationsSchema.orderId],
            references: [OrdersSchema.id],
        }),
        warehouse: one(WarehousesSchema, {
            fields: [StockReservationsSchema.warehouseId],
            references: [WarehousesSchema.id],
        }),
        product: one(ProductsSchema, {
            fields: [StockReservationsSchema.productId],
            references: [ProductsSchema.id],
        }),
    }),
);