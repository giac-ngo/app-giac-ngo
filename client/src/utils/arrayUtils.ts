// client/src/utils/arrayUtils.ts
export const normalizePostgresArray = (value: any): string[] => {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const content = value.substring(1, value.length - 1);
        if (!content) return [];
        // Improved parsing for strings containing commas and quotes
        return content.match(/("([^"]|\\")*"|[^,]+)/g)?.map(item =>
            item.replace(/^"|"$/g, '').replace(/\\"/g, '"')
        ) || [];
    }
    return [];
};
