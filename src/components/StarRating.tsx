'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, totalStars = 5, className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, i) => (
        <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" />
      ))}
    </div>
  );
};

export default StarRating;
