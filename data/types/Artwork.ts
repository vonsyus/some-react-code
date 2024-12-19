interface TAttributeValue {
  type: 'date' | 'string' | 'shortened_string' | 'number';
  value: string;
  totals?: number;
  pct?: number;
  label?: string;
}

export interface TAttributeCategory {
  label: string;
  values: TAttributeValue[];
}

export interface TAttribute {
  pct: number;
  totals: number;
  trait_type: string;
  value: string;
}

export interface TAttributes {
  total?: number;
  categories: TAttributeCategory[];
}

export interface TProvenance {
  type: 'mint' | 'transaction' | 'purchase';
  by?: string;
  from?: string;
  price?: string;
  txUrl?: string;
}

interface ArtworkAsset {
  type: string;
  url: string;
}

export interface TGeometryArtwork {
  artist: string;
  artworkUUID: string;
  collectionName: string;
  assets: ArtworkAsset[];
  openseaURL: string;
  edition: number;
  geometry: number;
  geometryRoman: string;
  tokenID: number;
  totalEditions: number;
  provenance?: TProvenance[] | null;
}

export interface TFALTArtwork {
  Image: {
    url: string;
    resolution: string;
    filesize: string;
    metadata: {
      artist: string;
      attributes: TAttributeCategory[];
      name: string;
      date: string;
    };
    wordCloud?: string;
  };
  tokenId: string;
  owner: string;
  openseaURL?: string;
  collectionName: string;
  status: string;
  provenance?: TProvenance[];
}

export interface GenerationsArtwork {
  Image: {
    availability: boolean;
    expireAt?: string | null;
    filesize: string;
    imageUuid: string;
    resolution: string;
    url: string;
    wordCloud?: string;
    metadata: {
      artist?: string;
      attributes: TAttributeCategory[];
      description: string;
      image: string;
      name: string | null;
      date: string;
      collectorRights: string;
      original: string;
    };
  };

  artworkUUID: string;
  collectionName: string;
  openseaURL: string;
  owner: string;
  provenance?: TProvenance[];
  status: string;
  tokenId: string;
}

export interface TNascentArtwork {
  availability: boolean;
  expireAt?: string | null;
  metadata: {
    artist: string;
    attributes: TAttributeCategory[];
    collectorRights: string;
    date: string;
    description: string;
    image: string;
    name: string;
    animation: string;
  }
  tokenId: string;
  pillName: string;
  resolution: string;
  provenance?: TProvenance[];
}

export interface TFeelGoodSpinsArtworkImage {
  availability: boolean;
  expireAt?: string | null;
  filesize: string;
  imageUuid: string;
  pillAltName?: string;
  pillName?: string;
  resolution?: string;
  url: string;
  wordCloud?: string;
  metadata: {
    artist: string;
    attributes: TAttributeCategory[];
    description: string;
    image: string;
    name: string;
    date: string;
    collectorRights: string;
    original: string;
    word1: string;
    word2: string;
    word3: string;
  };
}

export interface TFeelGoodSpinsArtwork {
  Image: TFeelGoodSpinsArtworkImage;
  agreement?: string;
  artworkUUID: string;
  collectionName: string,
  edition?: string,
  formerPill?: string,
  medium?: string,
  openseaURL?: string,
  owner: string,
  privateMint: string,
  provenance?: TProvenance[];
  publicMint?: string,
  revealedAt?: string,
  status: string,
  tokenId: string,
  year?: string
}
