import { FC, useEffect, useState } from 'react';
import { GenerationsArtworkGridDesktop } from '@/components/templates/generations/GenerationsArtworkGrid/GenerationsArtworkGridDesktop';
import {
  GenerationsArtworkGridMobileGrid,
  GenerationsArtworkGridMobileSlider,
} from '@/components/templates/generations/GenerationsArtworkGrid/GenerationsArtworkGridMobile';
import { GenerationsArtwork } from '@/data/types/Artwork';
import { useDeviceSize } from '@/hooks';

type Props = {
  video: { id: string; thumbnailUrl: string };
  staticQuilts: GenerationsArtwork[];
  staticQuiltsDetails?: { label: string; value: string }[];
};

const DESKTOP_LIMIT_INITIAL = 7;
const MOBILE_LIMIT_INITIAL = 8;
const LIMIT_AFTER_FIRST_LOAD = 18;

const getUrl = (limit: number, offset: number) =>
  `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/collection/generations/artworks?limit=${limit}&offset=${offset}&status=sold`;

export const GenerationsArtworkGrid: FC<Props> = (props) => {
  const { video, staticQuilts, staticQuiltsDetails } = props;
  const [artworksState, setArtworksState] = useState<GenerationsArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const { isDesktop } = useDeviceSize();

  // Mocks for the mocks data
  // const isFull = true;
  // const onLoadMoreClick = () => {};
  // useEffect(() => {
  //   setArtworksState(staticQuilts);
  // }, []);
  // END of mocks for the mocks =)

  // REAL DATA FETCHING
  const fetchArtworks = (limit: number, offset: number) => {
    setIsLoading(true);
    fetch(getUrl(limit, offset))
      .then((res) => res.json())
      .then((data: { artworks: any[]; total: number }) => {
        setArtworksState([...artworksState, ...(data.artworks || [])]);
        setTotal(data.total);
      })
      .catch((err) => console.error('Failed to fetch generations artworks', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchArtworks(isDesktop ? DESKTOP_LIMIT_INITIAL : MOBILE_LIMIT_INITIAL, 0);
  }, []);

  const onLoadMoreClick = () => {
    fetchArtworks(LIMIT_AFTER_FIRST_LOAD, artworksState.length);
  };

  if (isLoading && !artworksState.length) return null;
  if (!artworksState.length) return null;

  const isFull = artworksState.length === total;

  return (
    <>
      {/*<GenerationsArtworkGridMobileSlider artworks={artworksState} video={video} details={staticQuiltsDetails} />*/}
      <GenerationsArtworkGridMobileGrid
        artworks={artworksState}
        video={video}
        details={staticQuiltsDetails}
        isLoading={isLoading}
        showLoadMore={!isFull}
        onLoadMoreClick={onLoadMoreClick}
      />
      <GenerationsArtworkGridDesktop
        artworks={artworksState}
        video={video}
        details={staticQuiltsDetails}
        isLoading={isLoading}
        showLoadMore={!isFull}
        onLoadMoreClick={onLoadMoreClick}
      />
    </>
  );
};
