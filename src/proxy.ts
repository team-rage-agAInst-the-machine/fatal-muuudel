import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const publicPaths = ["/login", "/register"];
  const isPublic = publicPaths.some((p) => nextUrl.pathname.startsWith(p));

  if (isLoggedIn && isPublic) {
    return Response.redirect(new URL("/swipe", nextUrl));
  }

  if (!isLoggedIn && !isPublic) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
