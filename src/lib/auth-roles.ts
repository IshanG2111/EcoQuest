export type UserRole = 'student' | 'teacher' | 'admin';

const TEACHER_ACCOUNTS: string[] = [
    'ishan@ecoquest.com',
    'rick@ecoquest.com',
    'shreyansh@ecoquest.com',
    'bhavya@ecoquest.com',
    'shashwat@ecoquest.com',
    'mayank@ecoquest.com',
];

const ADMIN_ACCOUNTS: string[] = [
    'admin@ecoquest.com',
];

/**
 * Determines the role of a user based on their email address.
 * @param email The user's email address.
 * @returns The role of the user ('admin', 'teacher', or 'student').
 */
export function getRoleForUser(email: string): UserRole {
    if (ADMIN_ACCOUNTS.includes(email.toLowerCase())) {
        return 'admin';
    }
    if (TEACHER_ACCOUNTS.includes(email.toLowerCase())) {
        return 'teacher';
    }
    return 'student';
}
