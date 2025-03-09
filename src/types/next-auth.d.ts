import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
    interface User {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    }

    interface Session {
        user: User & {
            id: string;
            role: UserRole;
        };
    }
} 