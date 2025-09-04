/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

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

        // Check for admin credentials (temporary for demo)
        if (user.email === 'admin@crystal.com' && credentials.password === 'admin123') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: 'ADMIN',
          }
        }

        // For users with stored passwords, verify hash
        if (user.password) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role || 'USER',
          }
        }

        // For users without password, deny login and prompt to set password
        throw new Error('No password set for this account. Please contact administrator or use password reset if available.')
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
