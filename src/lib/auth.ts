/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
// import bcrypt from 'bcryptjs' // Commented out until password hashing is implemented

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        // Check if user is disabled
        if (user.disabled) {
          throw new Error('Account is disabled. Please contact administrator.')
        }

        // Check for admin credentials
        if (user.email === 'admin@crystal.com' && credentials.password === 'admin123') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: 'ADMIN', // Use enum value
          }
        }

        // For demo purposes, we'll accept any password for non-admin users
        // In production, you should implement proper password hashing and verification
        // const isPasswordValid = await bcrypt.compare(
        //   credentials.password,
        //   user.password
        // )

        // For now, just check if password matches (you should implement proper hashing)
        // This is a simplified version for the demo - any password works for non-admin users
        if (user.email !== 'admin@crystal.com') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role || 'USER', // Use database role or default to USER
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token?: any }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}
