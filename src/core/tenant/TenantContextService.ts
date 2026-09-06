import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore
{
    tenantId: string;
    userId?: string;
}

@Injectable()
export class TenantContextService
{
    // نمونه‌سازی از ابزار بومی نودجی‌اس
    private readonly als = new AsyncLocalStorage<TenantContextStore>();

    /**
     * کانتکست را برای کل طول عمر این درخواست فعال می‌کند
     */
    run<T>(store: TenantContextStore, fn: () => Promise<T>): Promise<T>
    {
        return this.als.run(store, fn);
    }

    /**
     * دریافت شناسه مستأجر برای روت‌های احراز هویت شده.
     * اگر وجود نداشت بلافاصله Exception صادر می‌کند تا امنیت حفظ شود.
     */
    getTenantId(): string
    {
        const store = this.als.getStore();
        if (!store || !store.tenantId)
        {
            throw new UnauthorizedException('Tenant context is not established');
        }
        return store.tenantId;
    }

    /**
     * دریافت شناسه مستأجر در روت‌های عمومی یا سناریوهایی که ممکن است اختیاری باشد
     */
    getOptionalTenantId(): string | null
    {
        const store = this.als.getStore();
        return store?.tenantId ?? null;
    }
}