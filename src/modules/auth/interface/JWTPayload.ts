import { UserRoleEnum } from "../../../enum/UserRoleEnum";

export interface JWTPayload
{
    userId: string,
    tenantId: string,
    role: UserRoleEnum
}