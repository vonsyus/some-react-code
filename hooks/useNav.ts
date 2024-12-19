import { useContext } from 'react';
import { NavContext } from '../context/NavContext';

export const useNav = () => {
  const context = useContext(NavContext);
  return context;
};
