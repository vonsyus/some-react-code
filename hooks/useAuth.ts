import { Interpreter } from 'xstate';
import { AuthEvents, AuthContext, AuthTypestate } from '../auth/authMachine';
import { useContext, useEffect, useState } from 'react';
import { StateContext } from '../context/StateContext';
import { useActor } from '@xstate/react';
import { ethers } from 'ethers';
import { useProfile } from '@/hooks/useProfile';

const isWalletLocked = async () => {
  let locked = true;
  if (!window?.ethereum) return locked;

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  try {
    const accounts = await provider.listAccounts();

    locked = !accounts.length;
  } catch (e) {}

  return locked;
};

type UseAuth = () => UseAuthReturnValue;

interface UseAuthReturnValue {
  authService?: Interpreter<AuthContext, any, AuthEvents, AuthTypestate, any>;
  isAuthenticated: boolean;
  isWalletLocked: boolean;
}

export const useAuth: UseAuth = () => {
  const [isLocked, setIsLocked] = useState(true);
  const { authService } = useContext(StateContext);
  const { profileService } = useProfile();
  const [state] = useActor(authService!);
  const isAuthenticated = state.value === 'authenticated';

  useEffect(() => {
    isWalletLocked().then((isLocked) => setIsLocked(isLocked));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !profileService) return;

    profileService.send({
      type: 'PROFILE_FETCH_INITIATED',
    });
  }, [isAuthenticated, profileService]);

  return {
    authService,
    isAuthenticated: isAuthenticated,
    isWalletLocked: isAuthenticated && isLocked,
  };
};
