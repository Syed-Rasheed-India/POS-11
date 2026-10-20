"use client";

import { useState } from "react";

export type PermissionGroup = { module: string; permissions: { key: string; name: string }[] };

/** Checkbox grid that serialises the selection into a hidden CSV field. */
export function PermissionMatrix({
  name = "permissions",
  groups,
  selected,
  disabled,
  onChange,
}: {
  name?: string;
  groups: PermissionGroup[];
  selected: string[];
  disabled?: boolean;
  onChange?: (keys: string[]) => void;
}) {
  const [keys, setKeys] = useState<string[]>(selected);

  const toggle = (key: string) =>
    setKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      onChange?.(next);
      return next;
    });

  const toggleModule = (module: string, keysInModule: string[]) => {
    const allSelected = keysInModule.every((k) => keys.includes(k));
    setKeys((prev) => {
      const next = allSelected
        ? prev.filter((k) => !keysInModule.includes(k))
        : [...new Set([...prev, ...keysInModule])];
      onChange?.(next);
      return next;
    });
    void module;
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={keys.join(",")} readOnly />
      <p className="text-xs text-[#7A8086]">
        {keys.length} permission(s) selected
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const moduleKeys = group.permissions.map((p) => p.key);
          const allSelected = moduleKeys.every((k) => keys.includes(k));
          return (
            <div key={group.module} className="rounded-lg border border-[#E6EAED] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-[#092C4C]">{group.module}</p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleModule(group.module, moduleKeys)}
                  className="text-[11px] font-semibold text-[#FE9F43]"
                >
                  {allSelected ? "Clear" : "Select all"}
                </button>
              </div>
              <div className="space-y-1.5">
                {group.permissions.map((permission) => (
                  <label key={permission.key} className="flex items-start gap-2 text-[13px] text-[#212B36]">
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={keys.includes(permission.key)}
                      onChange={() => toggle(permission.key)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-[#D3D5D7] text-[#FE9F43]"
                    />
                    <span>{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
