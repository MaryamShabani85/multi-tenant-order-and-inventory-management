// 📁 src/shared/utils/UlidHelper.ts (یا هر مسیری که ترجیح می‌دهی)

const ULID_REGEX = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz]{26}$/;

export class UlidUtils
{
    static isValid(id: unknown): id is string
    {
        if (typeof id !== 'string')
        {
            return false;
        }
        return ULID_REGEX.test(id);
    }
}