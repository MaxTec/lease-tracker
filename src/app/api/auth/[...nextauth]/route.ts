import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcrypt';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/utils/db';
import { SESSION_MAX_AGE } from '@/constants';

export const authOptions: NextAuthOptions = {
    // @ts-expect-error - PrismaAdapter is not typed
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
        maxAge: SESSION_MAX_AGE,
    },
    pages: {
        signIn: '/',
        signOut: '/',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            // @ts-expect-error - CredentialsProvider is not typed
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                // Only allow users with valid roles
                const validRoles = ['LANDLORD', 'TENANT', 'ADMIN'];
                if (!user.role || !validRoles.includes(user.role)) {
                    throw new Error('User does not have a valid role');
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                };
            }
            // Ensure token always has a valid role
            if (!token.role || !['LANDLORD', 'TENANT', 'ADMIN'].includes(token.role as string)) {
                token.role = 'TENANT'; // fallback to TENANT if missing/invalid
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                },
            };
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 