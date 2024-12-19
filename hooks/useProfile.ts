import { useActor } from '@xstate/react';
import { useCallback, useContext } from 'react';
import { StateContext } from '../context/StateContext';
import { ProfileEvents, ProfileContext, ProfileTypestate, EmptyCanvas } from '../profile/profileMachine';
import { TProfile } from '../data/types/Profile';
import { Interpreter } from 'xstate';
import { TProfileArtwork } from '../profile/types/ProfileArtwork';

type UseProfile = () => UseProfileReturnValue;

interface UseProfileReturnValue {
  profileService?: Interpreter<ProfileContext, any, ProfileEvents, ProfileTypestate, any>;
  isProfileActive: boolean;
  isProfileUpdating: boolean;
  isProfileFetching: boolean;
  isProfileRejected: boolean;
  isProfileError: boolean;
  isProfileSuccess: boolean;
  artworks: TProfileArtwork[];
  profile?: TProfile;
  claims?: number;
  emptyCanvases?: EmptyCanvas[];
  requestProfile: () => void;
}

export const useProfile: UseProfile = () => {
  const { profileService } = useContext(StateContext);
  const [state] = useActor(profileService!);
  const isProfileActive = state.value === 'profile-fulfilled';
  const isProfileRejected = state.value === 'profile-rejected';
  const isProfileUpdating = state.value === 'updating-profile';
  const isProfileFetching = state.value === 'getting-profile';
  const { artworks, profile, showErrorMsg, showSuccessMsg, emptyCanvases } = state.context;
  const requestProfile = useCallback(() => {
    if (!profileService) return;
    profileService.send('PROFILE_FETCH_INITIATED');
  }, [profileService]);
  return {
    profileService,
    isProfileActive,
    isProfileUpdating,
    isProfileFetching,
    isProfileRejected,
    profile,
    claims: emptyCanvases?.length,
    emptyCanvases,
    isProfileError: showErrorMsg,
    isProfileSuccess: showSuccessMsg,
    artworks: artworks ?? [],
    requestProfile
  };
};
