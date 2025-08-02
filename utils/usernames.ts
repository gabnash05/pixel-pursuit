export const truncateUsername = (name: string, maxLength: number = 15): string => {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
};