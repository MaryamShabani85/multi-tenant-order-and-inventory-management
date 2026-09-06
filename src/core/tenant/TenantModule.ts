import { Global, Module } from "@nestjs/common";
import { TenantContextService } from "./TenantContextService";

// 📁 TenantModule.ts
@Global()          // فقط TenantModule را گلوبال می‌کند
@Module({
    providers: [TenantContextService],
    exports: [TenantContextService],
})
export class TenantModule { }