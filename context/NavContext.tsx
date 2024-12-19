import { createContext, FC, PropsWithChildren, useCallback, useState } from 'react';
import { useRouter } from 'next/router';

interface NavContext {
  navState: NavState;
  isSubscribeOpen: boolean;
  openNav(closeOnConnect?: boolean): void;
  closeNav(): void;
  setSubscribeState(isOpen: boolean): void;
}

interface NavState {
  isOpen: boolean;
  closeAfterConnect: boolean;
}

const defaultState = {
  navState: {
    isOpen: false,
    closeAfterConnect: false
  },
  isSubscribeOpen: false,
  openNav: () => null,
  closeNav: () => null,
  setSubscribeState: () => null
};

export const NavContext = createContext<NavContext>(defaultState);

export const NavProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const [navState, setNavState] = useState<NavState>(defaultState.navState);
  const [isSubscribeOpen, setSubscribeState] = useState(router.query.hasOwnProperty('popup'));
  const openNav = useCallback((closeAfterConnect: boolean) => {
    setNavState({ isOpen: true, closeAfterConnect });
  }, []);
  const closeNav = useCallback(() => {
    setNavState({ isOpen: false, closeAfterConnect: false });
  }, []);

  return (
    <NavContext.Provider
      value={{
        navState,
        isSubscribeOpen,
        openNav,
        closeNav,
        setSubscribeState
      }}
    >
      {children}
    </NavContext.Provider>
  );
};
