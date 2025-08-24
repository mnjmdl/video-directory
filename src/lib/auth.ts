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

        // Check for admin credentials
        if (user.email === 'admin@videohub.com' && credentials.password === 'admin123') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
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
        if (user.email !== 'admin@videohub.com') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
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
        token.username = (user as { username?: string }).username
      }
      return token
    },
    async session({ session, token }: { session: any; token?: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}
