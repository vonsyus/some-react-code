import { ComponentProps, FC, useState } from 'react';
import styles from '@/components/templates/generations/GenerationsArtworkGrid/GenerationsArtworkGrid.module.scss';
import mobileStyles from '@/components/templates/generations/GenerationsArtworkGrid/GenerationsArtworkGridMobile.module.scss';
import { Slider } from '@/components/sections/GeometriesGrid/Slider';
import Link from 'next/link';
import { Video } from '@/components/molecules';
import { useGenerationsArtworks } from '@/hooks/useGenerationsArtworks';
import { GenerationsArtworkGrid } from '@/components/templates/generations';
import cn from 'classnames';
import { useAddVisibleClass } from '@/hooks';

type PropsWithSlider = {
  artworks: ReturnType<typeof useGenerationsArtworks>['artworks'];
  video: ComponentProps<typeof GenerationsArtworkGrid>['video'];
  details: ComponentProps<typeof GenerationsArtworkGrid>['staticQuiltsDetails'];
};

export const GenerationsArtworkGridMobileSlider: FC<PropsWithSlider> = ({ artworks, video, details }) => {
  return (
    <div className={styles.mobileWrapper}>
      <div className={styles.slider}>
        <Slider
          content={artworks.map((artwork) => (
            <div className={mobileStyles.link} key={artwork.tokenId}>
              <img className="" src={artwork.Image?.url} alt="" />
            </div>
            // <Link href={`/generations/${artwork.tokenId}`} className={mobileStyles.link} key={artwork.tokenId}>
            //   <img className="" src={artwork.Image?.url} alt="" />
            // </Link>
          ))}
        />
      </div>

      <div className={styles.gridItemVideo}>
        <Video {...video} />
      </div>
    </div>
  );
};

type PropsForGrid = {
  artworks: ReturnType<typeof useGenerationsArtworks>['artworks'];
  video: ComponentProps<typeof GenerationsArtworkGrid>['video'];
  details: ComponentProps<typeof GenerationsArtworkGrid>['staticQuiltsDetails'];

  showLoadMore: boolean;
  isLoading: boolean;
  onLoadMoreClick: () => void;
};

export const GenerationsArtworkGridMobileGrid: FC<PropsForGrid> = (props) => {
  const { artworks, video, showLoadMore, isLoading, onLoadMoreClick } = props;
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useAddVisibleClass(ref, 'data-lines-animation', 'lines-visible');

  return (
    <div className={styles.mobileWrapper}>
      <div className={styles.mobileGrid} ref={setRef}>
        {artworks.map((artwork, index) => (
          <Link
            href={`/generations/${artwork.tokenId}`}
            key={artwork.tokenId}
            data-lines-animation
            className={cn(styles.mobileGridLink, styles.shortLineAfter, 'lines-visible', {
              [styles.borderRight]: index % 2 == 0,
            })}>
            <img className="" src={artwork.Image?.url} alt="" />
          </Link>
        ))}
      </div>

      {showLoadMore && (
        <button
          disabled={isLoading}
          className={`h5-desktop h5-semi-mobile link-underline ${styles.loadMoreButton}`}
          style={{ display: 'block' }}
          onClick={onLoadMoreClick}>
          {isLoading ? 'Loading...' : 'Load More +'}
        </button>
      )}

      <div className={styles.gridItemVideo}>
        <Video {...video} />
      </div>
    </div>
  );
};
