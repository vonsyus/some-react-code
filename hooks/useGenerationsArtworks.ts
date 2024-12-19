import { useEffect, useState } from 'react';
import { GenerationsArtwork } from '@/data/types/Artwork';

enum Status {
  available = 'available',
  sold = 'sold',
  revealed = 'revealed',
}

const getUrl = (limit: number, offset: number, status: Status = Status.sold) =>
  `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/collection/generations/artworks?limit=${limit}&offset=${offset}&status=${status}`;

export const useGenerationsArtworks = (limit: number, offset: number) => {
  const [artworks, setArtworks] = useState<GenerationsArtwork[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(getUrl(limit, offset))
      .then((res) => res.json())
      .then((data: { artworks: any[]; total: number }) => {
        setArtworks(data.artworks);
        setTotal(data.total);
      })
      .catch((err) => console.error('Failed to fetch generations artworks', err))
      .finally(() => setIsLoading(false));
  }, []);

  return { artworks, total, isLoading };
};
