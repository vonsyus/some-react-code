import { useMediaQuery } from 'react-responsive';

const CSS_BREAKPOINT = 1024;

export const useDeviceSize = () => {
  const isDesktop = useMediaQuery({ query: `(min-width: ${CSS_BREAKPOINT}px)` });
  const isMobile = useMediaQuery({ query: `(max-width: ${CSS_BREAKPOINT - 1}px)` });

  return { isDesktop, isMobile };
};
