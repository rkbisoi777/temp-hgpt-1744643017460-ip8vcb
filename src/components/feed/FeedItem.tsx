import { PropertyCard } from '../property/PropertyCard';
import { NewsCard } from './NewsCard';
import { ImageCard } from './ImageCard';
import { VideoCard } from './VideoCard';
import { InfoCard } from './InfoCard';
import { OfferCard } from './OfferCard';
import { PropertyGridCard } from './PropertyGridCard';


export type FeedItemType = 'property' | 'news' | 'image' | 'video' | 'info' | 'offer' | 'propertyGrid';

interface FeedItemProps {
  type: FeedItemType;
  data: any;
}

export function FeedItem({ type, data }: FeedItemProps) {
  switch (type) {
    case 'property':
      return <div className='mb-4'><PropertyCard propertyId={data.id} /></div>;
    case 'news':
      return <NewsCard news={data} />;
    case 'image':
      return <ImageCard image={data} />;
    case 'video':
      return <VideoCard video={data} />;
    case 'info':
      return <InfoCard info={data} />;
    case 'offer':
      return <OfferCard offer={data} />;
    case 'propertyGrid':
      return <PropertyGridCard properties={data} />;
    default:
      return null;
  }
}