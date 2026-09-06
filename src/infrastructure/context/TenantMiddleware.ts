import { Injectable, NestMiddleware, BadRequestException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TenantContextService } from "../../core/tenant/TenantContextService";
import { UlidUtils } from "../../common/utils/ULIDUtils";

@Injectable()
export class TenantMiddleware implements NestMiddleware
{
    // تزریق یکتای سرویس توسط موتور NestJS (تضمین کارکرد صحیح AsyncLocalStorage)
    constructor(private readonly tenantContextService: TenantContextService) { }

    async use(req: Request, res: Response, next: NextFunction): Promise<void>
    {
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId || typeof tenantId !== 'string')
        {
            throw new BadRequestException('Header "x-tenant-id" is required.');
        }

        if (!UlidUtils.isValid(tenantId))
        {
            throw new BadRequestException('Invalid "x-tenant-id" format. Must be a valid 26-character ULID.');
        }

        // اجرای بقیه درخواست درون کانتکست ایزوله همین مستأجر
        await this.tenantContextService.run({ tenantId }, async () =>
        {
            next();
        });
    }
}