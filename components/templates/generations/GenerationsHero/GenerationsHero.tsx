import { FC, Fragment, useState } from 'react';
import styles from './GenerationsHero.module.scss';
import { Mark1Svg } from '@/svg';
import { useAddVisibleClass } from '@/hooks/useVisibleLines';
import { useFadeIn } from '@/hooks/useFadeIn';

type Props = {
  authors: string[];
  collection: string;
  image: string;
};

export const GenerationsHero: FC<Props> = (props) => {
  const { authors, collection, image } = props;
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useAddVisibleClass(ref, 'data-lines-animation', 'lines-visible');
  useFadeIn(ref, 'data-fade-in');

  return (
    <section ref={setRef} className={styles.heroContainer}>
      <Mark1Svg className={styles.markTop} fill="#5f3864" preserveAspectRatio="none" />

      <div className={styles.imageWrapper}>
        <h2 className={`h5-mobile h5-desktop ${styles.authors}`}>
          {authors.map((author, index) => {
            return (
              <Fragment key={author}>
                {author} {index !== authors.length - 1 && <span className={styles.authorDivider}>x</span>}
              </Fragment>
            );
          })}
        </h2>
        <h1 className={`h1-mobile h1-desktop ${styles.heading}`}>{collection}</h1>
        <img src={image} alt={collection} />
      </div>
    </section>
  );
};
