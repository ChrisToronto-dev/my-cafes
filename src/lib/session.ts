import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionData {
  id?: string;
  isLoggedIn?: boolean;
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "my-cafe-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return await getIronSession<SessionData>(cookieStore as any, sessionOptions);
}
