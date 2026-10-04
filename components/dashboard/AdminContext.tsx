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
