import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/swipe/:path*", "/abductions/:path*", "/profile/:path*"],
};
