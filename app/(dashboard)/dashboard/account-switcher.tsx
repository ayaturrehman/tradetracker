"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AccountOption = {
  id: string;
  name: string;
};

type AccountSwitcherProps = {
  accounts: AccountOption[];
  selectedAccountId: string | null;
};

export function AccountSwitcher({ accounts, selectedAccountId }: AccountSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("accountId");
    } else {
      params.set("accountId", value);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <label className="inline-flex flex-col text-sm font-medium text-foreground/70">
      Account filter
      <select
        defaultValue={selectedAccountId ?? "all"}
        onChange={handleChange}
        className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none sm:w-60"
      >
        <option value="all">All accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </label>
  );
}
