import { Module } from "@nestjs/common";
import { DRIZZLE_PROVIDER, DrizzleProvider } from "./DrizzleProvider";
import { ConfigModule } from "@nestjs/config";

// 📁 DatabaseModule.ts
@Module({
    imports: [ConfigModule],
    providers: [DrizzleProvider],
    exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule { }