'use client';

import { createContext, useContext } from 'react';

/** Signed-in admin plus sidebar badge counts, provided by the dashboard layout. */
export type AdminInfo = {
  email: string;
  name: string | null;
  counts: { pendingOrders: number; unreadMessages: number };
};

export const AdminContext = createContext<AdminInfo | null>(null);
export const useAdmin = () => useContext(AdminContext);

const COUNTS_CHANGED = 'admin:counts-changed';

/** Ask the dashboard layout to re-fetch badge counts after a status change. */
export const refreshAdminCounts = () =>
  window.dispatchEvent(new Event(COUNTS_CHANGED));

/** Runs `onChange` whenever a page calls refreshAdminCounts(). */
export const onAdminCountsChanged = (onChange: () => void) => {
  window.addEventListener(COUNTS_CHANGED, onChange);
  return () => window.removeEventListener(COUNTS_CHANGED, onChange);
};
