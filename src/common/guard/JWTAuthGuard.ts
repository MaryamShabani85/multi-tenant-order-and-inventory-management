import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorator/Public";
import { Request } from "express"

@Injectable()
export class JWTAuthGuard implements CanActivate
{
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
    )
    { }
    async canActivate(context: ExecutionContext): Promise<boolean>
    {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic)
            return true;

        let request = context.switchToHttp().getRequest();
        let token = this.extractTokenFromHeader(request);
        if (!token)
            throw new UnauthorizedException('توکن احراز هویت یافت نشد');

        try
        {
            request['user'] = await this.jwtService.verifyAsync(token);
        }
        catch 
        {
            throw new UnauthorizedException('توکن نامعتبر یا منقضی شده است');
        }

        return true;
    }
    private extractTokenFromHeader(request: Request): string | undefined
    {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}