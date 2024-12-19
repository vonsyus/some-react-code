import { FC, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { useFadeIn } from '@/hooks/useFadeIn';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  quote: {
    quoteTitle?: string;
    text: string;
    quoterName: string;
    quoterTitle: string;
    quoterImgUrl: string;
    url: string;
    increaseAuthorMargin?: boolean;
    increaseAuthorWidth?: boolean;
    isPaddingOutside?: boolean;
    quoteImage?: string;
  };
}

export const Quote: FC<Props> = ({ quote }) => {
  const [isReadMoreVisible, setIsReadMoreVisible] = useState(false);
  const readMoreRef = useRef<HTMLDivElement | null>(null);
  const [quoteRef, setQuoteRef] = useState<HTMLAnchorElement | null>(null);
  const theme = useTheme();

  useFadeIn(quoteRef, 'data-fade-in');

  useEffect(() => {
    if (!quoteRef) return;
    const onMouseMove = (e: MouseEvent) => {
      const readMore = readMoreRef.current;
      if (!readMore) return;
      readMore.style.top = `${e.offsetY}px`;
      readMore.style.left = `${e.offsetX}px`;
    };
    quoteRef.addEventListener('mousemove', onMouseMove);
    return () => {
      quoteRef.removeEventListener('mousemove', onMouseMove);
    };
  }, [quoteRef]);

  return (
    <Link
      className={cn('quote')}
      onMouseEnter={() => setIsReadMoreVisible(true)}
      onMouseLeave={() => setIsReadMoreVisible(false)}
      ref={setQuoteRef}
      href={quote.url}
    >
      {quote.quoteTitle && (
        <div
          className={cn('quote-title h7-desktop h7-sentence-mobile', {
            'quote-title-nascent': theme === 'nascent'
          })}
          data-fade-in
        >
          {quote.quoteTitle}
        </div>
      )}
      <h4
        className={cn('quote-text h4-desktop h4-sentence-mobile', {
          'quote-text-nascent': theme === 'nascent'
        })}
        data-fade-in
      >
        {quote.text}
      </h4>
      <div className={cn('quote-wrapper', { 'more-margin': quote.increaseAuthorMargin, 'more-width': quote.increaseAuthorWidth })}>
        <img className="quote-image" src={quote.quoterImgUrl} data-fade-in />
          <p
            className={cn('quote-quoter h7-desktop h7-semi-mobile', {
              'quote-quoter-nascent': theme === 'nascent'
            })}
            data-fade-in
            dangerouslySetInnerHTML={{ __html: quote.quoterName  + '<br>' + quote.quoterTitle}}
          />
      </div>
      <div
        className={cn('quote-read-more h5-desktop h5-semi-mobile', {
          'quote-read-more-visible': isReadMoreVisible,
        })}
        ref={readMoreRef}>
        Read more
      </div>
    </Link>
  );
};
