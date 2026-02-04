import NextAuth, { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authApi } from "@/lib/api/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          })

          // Explicitly type the return
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.khc_advocate_name,
            khcAdvocateId: response.user.khc_advocate_id,
            accessToken: response.access_token,
            refreshToken: response.refresh_token || response.access_token,
          }

          return user
        } catch (error) {
          console.error("Login error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.khcAdvocateId = user.khcAdvocateId
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        khcAdvocateId: token.khcAdvocateId,
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
// import NextAuth, { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { authApi } from "@/lib/api/auth"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null
//         }

//         try {
//           const response = await authApi.login({
//             email: credentials.email,
//             password: credentials.password,
//           })

//           // Return user object with all required fields
//           return {
//             id: response.user.id,
//             email: response.user.email,
//             name: response.user.khc_advocate_name,
//             khcAdvocateId: response.user.khc_advocate_id,
//             accessToken: response.access_token,
//             refreshToken: response.refresh_token || "", // Add this line
//           }
//         } catch (error) {
//           console.error("Login error:", error)
//           return null
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.accessToken = user.accessToken
//         token.refreshToken = user.refreshToken
//         token.khcAdvocateId = user.khcAdvocateId
//       }
//       return token
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken as string
//       session.user = {
//         ...session.user,
//         khcAdvocateId: token.khcAdvocateId as string,
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 24 * 60 * 60, // 24 hours
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// }

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }
