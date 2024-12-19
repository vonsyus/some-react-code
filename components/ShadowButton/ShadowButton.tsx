import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import cn from 'classnames';
import { useTheme } from '@/hooks/useTheme';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isInverted?: boolean;
  noPadding?: boolean;
}

export const ShadowButton: FC<PropsWithChildren<Props>> = ({ children, isInverted = false, noPadding = false, className, ...props }) => {
  const theme = useTheme();
  return (
    <button
      {...props}
      className={cn('shadow-button h5-desktop h5-semi-mobile', className, {
        'shadow-button-inverted': isInverted,
        'shadow-button-nascent': theme === 'nascent',
        'shadow-button-no-padding': noPadding
      })}
    >
      <span className="shadow-button-text">{children}</span>
    </button>
  );
};
