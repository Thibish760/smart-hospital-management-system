import React, { createContext, useContext, useState } from 'react';

interface NavContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const NavContext = createContext<NavContextType>({
  activePage: 'dashboard',
  setActivePage: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <NavContext.Provider value={{ activePage, setActivePage, sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);
