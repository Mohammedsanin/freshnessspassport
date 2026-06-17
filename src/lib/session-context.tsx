import { createContext, useContext } from "react";

export type Session = {
  email: string;
  fullName: string;
  role: "user" | "admin";
  storeName?: string;
  avatarDataUrl?: string;
};

type Ctx = {
  session: Session | null;
  signOut: () => void;
};

const SessionContext = createContext<Ctx>({ session: null, signOut: () => {} });

export const SessionProvider = SessionContext.Provider;
export function useSession() {
  return useContext(SessionContext);
}
