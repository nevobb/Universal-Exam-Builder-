/**
 * Returns true if data is a non-empty array whose first item
 * has the four required question fields.
 */
export function isValidQuestionArray(data) {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        ['id', 'type', 'question', 'solution'].every((k) => k in data[0])
    );
}

/**
 * Returns true if val is an integer between 1 and 300 (inclusive).
 */
export function isValidTime(val) {
    const n = Number(val);
    return Number.isInteger(n) && n >= 1 && n <= 300;
}
