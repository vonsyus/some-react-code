import { ReactNode } from 'react';
import styles from './StickySidebarLayout.module.scss';

type CommonProps = {
  children: ReactNode;
  className?: string;
};

const LeftSidebar = ({ children, className = '' }: CommonProps) => {
  return <div className={`${styles.left} ${className}`}>{children}</div>;
};

const RightSidebar = ({ children, className = '' }: CommonProps) => {
  return <div className={`${styles.right} ${className}`}>{children}</div>;
};

const StickyContent = ({ children, className = '' }: CommonProps) => {
  return (
    <div className={`${styles.stickyContentBox} ${className}`}>
      <div className={styles.stickyContent}>{children}</div>
    </div>
  );
};

type StickySidebarLayoutBaseProps = CommonProps;
const StickySidebarLayoutBase = ({ children, className = '' }: StickySidebarLayoutBaseProps) => {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
};

export const StickySidebarLayout = {
  Base: StickySidebarLayoutBase,
  Sidebar: {
    Left: LeftSidebar,
    Right: RightSidebar,
  },
  StickyContent,
};
