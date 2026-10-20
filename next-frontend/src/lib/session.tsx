"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getTenant, type Tenant } from "./mock";
import { DEMO_ACCOUNTS, type DemoSession } from "./demo-accounts";

export type { DemoSession };
export { DEMO_ACCOUNTS };

type SessionValue = {
  session: DemoSession;
  tenant: Tenant;
  signIn: (session: DemoSession) => void;
  signOut: () => void;
  switchCompany: (companyId: number) => void;
  can: (permission: string) => boolean;
};

const SessionContext = createContext<SessionValue | null>(null);

const ownerFor = (companyId: number): DemoSession => {
  const tenant = getTenant(companyId);
  const owner = tenant.users[0];
  return {
    kind: "COMPANY",
    name: owner.name,
    email: owner.email,
    role: "Company Admin",
    permissions: tenant.roles[0].permissions,
    companyId,
  };
};

export function SessionProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: DemoSession;
}) {
  const [session, setSession] = useState<DemoSession>(initial);

  const value = useMemo<SessionValue>(() => {
    const tenant =
      session.kind === "COMPANY" ? getTenant(session.companyId) : getTenant(1);
    return {
      session,
      tenant,
      signIn: setSession,
      signOut: () => setSession(DEMO_ACCOUNTS[1]),
      switchCompany: (companyId: number) => setSession(ownerFor(companyId)),
      can: (permission: string) =>
        session.kind === "PLATFORM" ? true : session.permissions.includes(permission),
    };
  }, [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>");
  return value;
}

export function useTenant(): Tenant {
  return useSession().tenant;
}
