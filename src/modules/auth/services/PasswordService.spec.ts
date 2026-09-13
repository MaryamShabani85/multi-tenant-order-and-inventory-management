import { Test, TestingModule } from "@nestjs/testing";
import { PasswordService } from "./PasswordService";

describe('PasswordService', () => 
{
    let passwordService: PasswordService;

    beforeEach(async () =>
    {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PasswordService]
        }).compile();
        passwordService = module.get<PasswordService>(PasswordService);
    });

    describe('hash', () => 
    {
        const password = "123";

        it("باید مقدار هش شده رمز عبور را برگرداند", async () => 
        {
            const hashedPassword = await passwordService.hash(password);
            expect(hashedPassword).toBeDefined();
        });
    });

    describe('verifyCompare', () => 
    {
        const password = "Password123!";
        it("اگر رمز عبور درست بود باید true برگرداند", async () => 
        {
            const hashedPassword = await passwordService.hash(password);
            expect(await passwordService.verifyCompare(password, hashedPassword)).toBe(true);
        });

        it("اگر رمز عبور اشتباه بود باید false برگرداند", async () => 
        {
            const wrongPassword = "Wrong1234";
            const hashedPassword = await passwordService.hash(password);
            expect(await passwordService.verifyCompare(wrongPassword, hashedPassword)).toBe(false);
        });
    });

});