import React, { createContext, useContext, useState } from 'react';

interface NavContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  toggleMobileNav: () => void;
}

const NavContext = createContext<NavContextType>({
  activePage: 'dashboard',
  setActivePage: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  toggleMobileNav: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSetActivePage = (page: string) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const toggleMobileNav = () => setMobileNavOpen(prev => !prev);

  return (
    <NavContext.Provider
      value={{
        activePage,
        setActivePage: handleSetActivePage,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);

