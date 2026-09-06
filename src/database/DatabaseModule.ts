import { Module } from "@nestjs/common";
import { DRIZZLE_PROVIDER, DrizzleProvider } from "./DrizzleProvider";

// 📁 DatabaseModule.ts
@Module({
    providers: [DrizzleProvider],
    exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule { }