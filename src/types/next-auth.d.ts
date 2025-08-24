declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      username: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    username: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
  }
}
