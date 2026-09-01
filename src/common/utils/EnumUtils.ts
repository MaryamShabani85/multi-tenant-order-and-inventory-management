/**
 * تبدیل یک TypeScript Enum به آرایه مناسب Drizzle ORM (Tuple با حداقل یک عضو)
 * همراه با حفظ کامل Type-Safety
 */
export function getEnumValues<T extends Record<string, string | number>>(
    enumObj: T,
): [T[keyof T], ...T[keyof T][]]
{
    const values = Object.values(enumObj) as T[keyof T][];
    return values as [T[keyof T], ...T[keyof T][]];
}
