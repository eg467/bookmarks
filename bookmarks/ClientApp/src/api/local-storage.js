export function getItem(key) {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : null;
}
export function setItem(key, value) {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
}
export function removeItem(key) {
    localStorage.removeItem(key);
}
export const fieldStorage = (key, defaultValue) => ({
    get: () => {
        let v = getItem(key);
        if (v === null && defaultValue !== undefined) {
            setItem(key, defaultValue);
            v = defaultValue;
        }
        return v;
    },
    set: (val) => setItem(key, val),
    clear: () => removeItem(key)
});
export default { getItem, setItem, removeItem, fieldStorage };
