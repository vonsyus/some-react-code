import { ComponentProps, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/components/templates/generations/GenerationsArtworkGrid/GenerationsArtworkGrid.module.scss';
import cn from 'classnames';
import { Mark5Svg, Mark6Svg, Mark7Svg } from '@/svg';
import { Video } from '@/components/molecules';
import { ActivePiecesSlider, ActivePiecesSlideType } from '@/components/ActivePieces/ActivePiecesSlider';
import { useAddVisibleClass } from '@/hooks/useVisibleLines';
import { useFadeIn } from '@/hooks/useFadeIn';
import { useGenerationsArtworks } from '@/hooks/useGenerationsArtworks';
import { GenerationsArtworkGrid } from '@/components/templates/generations';
import { Parallax } from 'react-scroll-parallax';
import { SplideSlide } from '@splidejs/react-splide';
import { ActivePiecesPreview } from '@/components/ActivePieces/ActivePiecesPreview';
import { ActivePiecesSlide } from '@/components/ActivePieces/ActivePiecesSlide';

type Props = {
  artworks: ReturnType<typeof useGenerationsArtworks>['artworks'];
  video: ComponentProps<typeof GenerationsArtworkGrid>['video'];
  details: ComponentProps<typeof GenerationsArtworkGrid>['staticQuiltsDetails'];
  showLoadMore: boolean;
  isLoading: boolean;
  onLoadMoreClick: () => void;
};

const renderSlide = (props: ActivePiecesSlideType & { onClaim: (imageUuid: string) => Promise<void> }): ReactNode => {
  return (
    <SplideSlide className="activePiecesSlider-slide">
      <ActivePiecesPreview {...props} />
      <ActivePiecesSlide {...props} hideClaim />
    </SplideSlide>
  );
};

export const GenerationsArtworkGridDesktop: FC<Props> = (props) => {
  const { artworks, video, details, showLoadMore, isLoading, onLoadMoreClick } = props;
  const [activeArtworkId, setActiveArtworkId] = useState<string>();
  const [parallaxTopOffset, setParallaxTopOffset] = useState(0);

  useEffect(() => {
    setParallaxTopOffset(window.innerHeight * -0.35); // to be in the center of the height of viewport
  }, []);

  const onSlideClose = useCallback(() => {
    setActiveArtworkId(undefined);
  }, []);

  const onDetailsClick = (imageUuid: string) => () => setActiveArtworkId(imageUuid);

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useAddVisibleClass(ref, 'data-lines-animation', 'lines-visible');
  useFadeIn(ref, 'data-fade-in');

  const artworkImagesData = useMemo(() => artworks.map(({ Image }) => Image), [artworks]);

  if (!artworks.length) return null;

  const onClaim = async (imageUuid: string) => {};

  return (
    <>
      <div ref={setRef} className={styles.grid}>
        {artworks.map((artwork, index) => {
          return (
            <div
              onClick={onDetailsClick(artwork.Image?.imageUuid)}
              style={{ cursor: 'pointer' }}
              key={artwork.tokenId}
              className={cn(styles.borderLeft, styles.shortLineAfter, {
                'lines-visible': index > 6,
                [styles.borderRight]: index > 6 && index % 3 === 1,
              })}
              data-lines-animation>
              {index < 3 && (
                <div className={cn(styles.shortLineBefore, { 'lines-visible': index > 6 })} data-lines-animation />
              )}
              <img src={artwork.Image?.url} alt="" {...(index < 7 && { 'data-fade-in': true })} />

              {index === artworks.length - 1 && (
                <Mark5Svg className={styles.markLastItem} width={62} height={153} fill="#15161A" />
              )}
              <span className={`h5-desktop ${styles.artworkClaim}`}>Details</span>
            </div>
          );
        })}
        <div className={`${styles.gridItemVideo} ${styles.shortLineAfter}`} data-lines-animation>
          <div className={styles.markVideoRightWrapper}>
            <Mark6Svg width={211} height={51} fill="#70B5C0" />
          </div>
          <Mark7Svg className={styles.markVideoBottom} width={117} height={89} fill="#FF7DAF" />
          <Parallax
            style={{ position: 'relative', zIndex: 2 }}
            translateY={['50%', '-50%']}
            rootMargin={{ top: parallaxTopOffset, right: 0, bottom: 0, left: 0 }}>
            <Video {...video} />
          </Parallax>
        </div>
      </div>

      {showLoadMore && (
        <button
          disabled={isLoading}
          className={`h5-desktop h5-semi-mobile link-underline ${styles.loadMoreButton}`}
          onClick={onLoadMoreClick}>
          {isLoading ? 'Loading...' : 'Load More +'}
        </button>
      )}

      {activeArtworkId && (
        <ActivePiecesSlider
          onClose={onSlideClose}
          items={artworkImagesData}
          activeId={activeArtworkId}
          onClaim={onClaim}
          isClaiming={false}
          renderSlide={renderSlide}
          details={details || []}
        />
      )}
    </>
  );
};
