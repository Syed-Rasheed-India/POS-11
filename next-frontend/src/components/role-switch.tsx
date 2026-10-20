"use client";

import { useEffect } from "react";
import { Icon } from "./icons";
import type { DemoSession } from "@/lib/demo-accounts";
import { useSession } from "@/lib/session";

/**
 * UI prototype helper: entering a panel with the wrong demo role switches
 * the signed in identity instead of blocking the screen, so every screen of
 * both panels stays reachable during a walkthrough.
 */
export function RoleSwitch({ target }: { target: DemoSession }) {
  const { signIn } = useSession();

  useEffect(() => {
    signIn(target);
  }, [signIn, target]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#F7F8F9]">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[#E6EAED] bg-white px-8 py-10 text-center shadow-sm">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FFF6EE] text-[#FE9F43]">
          <Icon name="refresh" className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-[#212B36]">Switching panel…</p>
        <p className="max-w-xs text-xs text-[#7A8086]">
          Signing in as {target.name} · {target.role}
        </p>
      </div>
    </div>
  );
}
