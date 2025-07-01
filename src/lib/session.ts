import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionData {
  id?: string;
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "my-cafe-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(cookies() as any, sessionOptions);
}