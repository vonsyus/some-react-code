import { ComponentProps, FC, useState } from 'react';
import { Quote } from '@/components/atoms';
import styles from './GenerationsQuote.module.scss';
import { useAddVisibleClass } from '@/hooks/useVisibleLines';

type Props = ComponentProps<typeof Quote>['quote'];

export const GenerationsQuote: FC<Props> = (props) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useAddVisibleClass(ref, 'data-lines-animation', 'lines-visible', 300);

  return (
    <div ref={setRef} className={styles.container}>
      <div className={styles.quoteWrapper}>
        <div className={styles.verticalLine} data-lines-animation />
        <Quote quote={props} />
      </div>
    </div>
  );
};
