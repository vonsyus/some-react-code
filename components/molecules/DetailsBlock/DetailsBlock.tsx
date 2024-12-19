import { FC, ReactNode } from 'react';
import styles from './DetailsBlock.module.scss';

type DetailsBlock = {
  title: string;
  titleTag?: 'h3' | 'h4' | 'h5' | 'div';
  children: ReactNode;
  className?: string;
};

export const DetailsBlock: FC<DetailsBlock> = ({ children, title, titleTag, className = '' }) => {
  const Tag = titleTag || 'h3';
  return (
    <div className={`${styles.box} ${className}`}>
      <Tag className={styles.title}>{title}</Tag>

      <div>{children}</div>
    </div>
  );
};
