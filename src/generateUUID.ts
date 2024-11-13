const UID_LENGTH: number = 16;

type RandomGenerator = {
    randomUUID?: () => string;
    getRandomValues: (Uint8Array) => Uint8Array;
};

export function generateUUID(randomGenerator: RandomGenerator): string {
    if (randomGenerator.randomUUID) {
        const uuid = randomGenerator.randomUUID();

        return uuid.replace(/-/g, '');
    }

    const randomValues = new Uint8Array(UID_LENGTH);
    const bytes = randomGenerator.getRandomValues(randomValues);

    return Array.from(bytes).map(byte => byte.toString(16)).join('');
}
