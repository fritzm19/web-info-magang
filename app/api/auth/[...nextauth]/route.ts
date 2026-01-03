import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

const handler = NextAuth({
  session: {
    strategy: "jwt", // Use JSON Web Tokens (easier for simple apps)
  },
  pages: {
    signIn: "/login", // Tell NextAuth where our custom login page is
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Check if user typed anything
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // 3. If no user found, return null (Login failed)
        if (!user) {
          return null;
        }

        // 4. Check if password matches the encrypted one
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 5. Return the user object (Login success!)
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role, // We will use this later for the Dashboard
        };
      },
    }),
  ],
  callbacks: {
    // This makes the "role" available in the session (Frontend)
    async session({ session, token }) {
      if (session?.user) {
        // @ts-expect-error: NextAuth types don't include 'role' yet
        session.user.role = token.role; 
        // @ts-expect-error: NextAuth types don't include 'id' yet
        session.user.id = token.id;
      }
      return session;
    },
    // This puts the "role" into the token (Backend)
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error: NextAuth default types don't include 'role'
        token.role = user.role;
        
        token.id = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };