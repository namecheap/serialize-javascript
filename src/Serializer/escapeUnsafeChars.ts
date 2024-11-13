const ESCAPED_CHARS: Record<string, string> = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
};

export function escapeUnsafeChars(unsafeChar: string): string {
    return ESCAPED_CHARS[unsafeChar];
}
