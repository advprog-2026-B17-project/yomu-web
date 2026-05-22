import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { apiRequest, apiRoutes, AuthResponse } from "@/lib/api";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Create or update user in database via API
        try {
          const data = await apiRequest<AuthResponse>(apiRoutes.auth.google, {
            method: "POST",
            body: {
              googleToken: account.id_token,
              email: user.email,
              username: user.email?.split("@")[0],
              displayName: user.name,
              googleId: profile?.sub,
              idToken: account.id_token,
            },
          });

          (user as any).token = data.token;
          (user as any).userId = data.userId;
          (user as any).role = data.role;
        } catch (err) {
          console.error("Google auth failed:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = (user as any).token;
        token.userId = (user as any).userId;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).userId = token.userId;
      (session as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
