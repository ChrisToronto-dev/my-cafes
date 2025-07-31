"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Star, Edit, Trash2, MapPin, UserCircle } from "lucide-react";
import Header from "@/components/Header";
import { useSession } from 'next-auth/react';
import StarRating from "@/components/StarRating";

import { Wifi, Coffee, Sun, BatteryCharging, Briefcase, PawPrint, Cake } from 'lucide-react';

interface Cafe {
  id: string;
  name: string;
  address: string;
  description: string;
  amenities: string;
  averageRating: number;
  averageLocationRating: number;
  averagePriceRating: number;
  averageCoffeeRating: number;
  averageBakeryRating: number;
  reviews: Review[];
  photos: Photo[];
  userId: string;
}

interface Review {
  id: string;
  text: string;
  overallRating: number;
  locationRating: number;
  priceRating: number;
  coffeeRating: number;
  bakeryRating: number;
  user: {
    email: string;
  };
  createdAt: string;
}

interface Photo {
  id: string;
  url: string;
}

const amenityOptions = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'specialty_coffee', label: 'Specialty Coffee', icon: Coffee },
  { id: 'patio', label: 'Patio', icon: Sun },
  { id: 'power_outlets', label: 'Power Outlets', icon: BatteryCharging },
  { id: 'good_for_working', label: 'Good for Working', icon: Briefcase },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: PawPrint },
  { id: 'desserts', label: 'Desserts', icon: Cake },
];

export default function CafeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchCafe() {
      try {
        const response = await fetch(`/api/cafes/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCafe(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchCafe();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this cafe?')) return;

    try {
      const response = await fetch(`/api/cafes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete cafe');
      }

      router.push('/');
    } catch (err: any) {
      alert(`Error deleting cafe: ${err.message}`);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-2xl font-semibold text-foreground">Loading cafe details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-destructive/10">
        <div className="text-2xl text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-2xl text-muted-foreground">Cafe not found.</p>
        </main>
      </div>
    );
  }

  const isOwner = session && (session.user as any).id === cafe.userId;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground">{cafe.name}</h1>
                <p className="text-muted-foreground flex items-center mt-2">
                  <MapPin className="h-5 w-5 mr-2" /> {cafe.address}
                </p>
              </div>
              {isOwner && (
                <div className="flex space-x-2 mt-4 md:mt-0 flex-shrink-0">
                  <Link href={`/cafes/${id}/edit`} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent">
                    <Edit className="-ml-1 mr-2 h-5 w-5" />
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-destructive hover:bg-destructive/90">
                    <Trash2 className="-ml-1 mr-2 h-5 w-5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            {cafe.photos.length > 0 && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img 
                  src={cafe.photos[0].url} 
                  alt={`Photo of ${cafe.name}`}
                  className="w-full h-auto md:h-[450px] object-cover"
                />
              </div>
            )}

            <div className="flex items-center mb-2">
                <StarRating rating={cafe.averageRating} />
              <div className="ml-4">
                <div className="bg-primary text-primary-foreground font-bold text-xl px-4 py-2 rounded-md">{cafe.averageRating.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">Based on {cafe.reviews.length} reviews</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-semibold w-24">Location:</span>
                <StarRating rating={cafe.averageLocationRating} />
                {cafe.averageLocationRating && <span className="font-bold text-sm ml-2">{cafe.averageLocationRating.toFixed(1)}</span>}
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-24">Price:</span>
                <StarRating rating={cafe.averagePriceRating} />
                {cafe.averagePriceRating && <span className="font-bold text-sm ml-2">{cafe.averagePriceRating.toFixed(1)}</span>}
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-24">Coffee:</span>
                <StarRating rating={cafe.averageCoffeeRating} />
                {cafe.averageCoffeeRating && <span className="font-bold text-sm ml-2">{cafe.averageCoffeeRating.toFixed(1)}</span>}
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-24">Bakery:</span>
                <StarRating rating={cafe.averageBakeryRating} />
                {cafe.averageBakeryRating && <span className="font-bold text-sm ml-2">{cafe.averageBakeryRating.toFixed(1)}</span>}
              </div>
            </div>

            {cafe.description && (
              <p className="text-lg text-foreground/90 mb-6 max-w-3xl">{cafe.description}</p>
            )}

            {cafe.amenities && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {cafe.amenities.split(',').map(amenity => {
                    const amenityDetail = amenityOptions.find(opt => opt.id === amenity);
                    if (!amenityDetail) return null;
                    return (
                      <div key={amenity} className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                        <amenityDetail.icon className="h-5 w-5" />
                        <span>{amenityDetail.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-secondary p-6 border-t border-border">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Reviews</h2>
            <div className="space-y-6">
              {cafe.reviews.length > 0 ? (
                cafe.reviews.map((review) => (
                  <div key={review.id} className="bg-card p-4 rounded-lg border border-border flex items-start space-x-4">
                    <UserCircle className="h-10 w-10 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{review.user.email}</p>
                          <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarRating rating={review.overallRating} />
                          <span className="font-bold text-sm">{review.overallRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-foreground/90 mt-2">{review.text}</p>
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-semibold w-24">Location:</span>
                          <StarRating rating={review.locationRating} />
                          {review.locationRating && <span className="font-bold text-sm ml-2">{review.locationRating.toFixed(1)}</span>}
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold w-24">Price:</span>
                          <StarRating rating={review.priceRating} />
                          {review.priceRating && <span className="font-bold text-sm ml-2">{review.priceRating.toFixed(1)}</span>}
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold w-24">Coffee:</span>
                          <StarRating rating={review.coffeeRating} />
                          {review.coffeeRating && <span className="font-bold text-sm ml-2">{review.coffeeRating.toFixed(1)}</span>}
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold w-24">Bakery:</span>
                          <StarRating rating={review.bakeryRating} />
                          {review.bakeryRating && <span className="font-bold text-sm ml-2">{review.bakeryRating.toFixed(1)}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first!</p>
              )}
            </div>
            <div className="mt-6">
              <Link
                href={`/cafes/${id}/add-review`}
                className="inline-block bg-primary text-primary-foreground font-bold py-3 px-6 rounded-md hover:bg-primary/90 transition-colors"
              >
                Write a review
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
