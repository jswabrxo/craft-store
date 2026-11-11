'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

type RackPosition = { slug: string; scrollY: number; url: string; focusId?: string };
type RackSession = {
  saved: string[];
  liftedProducts: { current: Set<string> };
  toggleSaved: (slug: string) => void;
  position: { current: RackPosition | null };
};

const RackSessionContext = createContext<RackSession | null>(null);

export function RackSessionProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const liftedProducts = useRef(new Set<string>());
  const position = useRef<RackPosition | null>(null);

  function toggleSaved(slug: string) {
    setSaved(current => current.includes(slug)
      ? current.filter(id => id !== slug)
      : [...current, slug]);
  }

  return (
    <RackSessionContext.Provider value={{ saved, toggleSaved, position, liftedProducts }}>
      {children}
    </RackSessionContext.Provider>
  );
}

export function useRackSession() {
  const session = useContext(RackSessionContext);
  if (!session) throw new Error('Missing rack session provider');
  return session;
}
