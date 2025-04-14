import { PropertyCard } from '../property/PropertyCard';

interface PropertyGridCardProps {
  properties: string[];
}

export function PropertyGridCard({ properties }: PropertyGridCardProps) {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-4">
        {properties.slice(0, 4).map((propertyId) => (
          <PropertyCard key={propertyId} propertyId={propertyId} />
        ))}
      </div>
    </div>
  );
}