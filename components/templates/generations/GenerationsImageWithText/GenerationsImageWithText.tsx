import { ComponentProps, FC } from 'react';
import { MediaWithText } from '@/components/sections/MediaWithText/MediaWithText';
import styles from './GenerationsImageWithText.module.scss';

type Props = ComponentProps<typeof MediaWithText>;

export const GenerationsImageWithText: FC<Props> = (props) => {
  return (
    <div className={styles.container}>
      <MediaWithText {...props} />
    </div>
  );
};
