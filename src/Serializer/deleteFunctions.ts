export function deleteFunctions(obj: any): void {
    for (const key in obj) {
        if (typeof obj[key] === 'function') {
            delete obj[key];
        }
    }
}
