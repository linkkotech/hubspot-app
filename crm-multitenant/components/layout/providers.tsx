"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";

type ProvidersProps = {
  children: React.ReactNode;
  session?: Session | null;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching data.");
    throw error;
  }

  return response.json();
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <SWRConfig
        value={{
          fetcher,
          shouldRetryOnError: false,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
