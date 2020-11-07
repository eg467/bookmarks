export function getItem(key: string) {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : null;
}

export function setItem(key: string, value: any) {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
}

export function removeItem(key: string) {
    localStorage.removeItem(key);
}

export const fieldStorage = <T>(key: string, defaultValue?: T) => ({
    get: () => {
        let v = getItem(key) as T;
        if (v === null && defaultValue !== undefined) {
            setItem(key, defaultValue);
            v = defaultValue;
        }
        return v;
    },
    set: (val: T) => setItem(key, val),
    clear: () => removeItem(key)
});

export default { getItem, setItem, removeItem, fieldStorage };