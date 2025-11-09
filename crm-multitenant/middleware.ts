export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/crm/:path*",
    "/projects/:path*",
    "/chat/:path*",
    "/api/(?!auth).*",
  ],
};
