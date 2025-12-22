/**
 * Utility functions for safe date handling to avoid timezone issues
 */

/**
 * Get current date string in YYYY-MM-DD format (local time)
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local Date object (at midnight)
 */
export function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Format a YYYY-MM-DD string into a readable Spanish date
 */
export function formatSpanishDate(dateStr: string, options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
}): string {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('es-ES', options);
}
