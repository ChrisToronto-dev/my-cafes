"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Star, Edit, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { useSession } from '@/lib/sessionContext';

interface Cafe {
  id: string;
  name: string;
  address: string;
  description: string;
  averageRating: number;
  reviews: Review[];
  photos: Photo[];
  userId: string; // Add userId to Cafe interface
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
  createdAt: string;
}

export default function CafeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { session, loading: loadingSession } = useSession();

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

      router.push('/'); // Redirect to home page after deletion
    } catch (err: any) {
      alert(`Error deleting cafe: ${err.message}`);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? "text-yellow-400" : "text-gray-400"}`}
            fill="currentColor"
          />
        ))}
      </div>
    );
  };

  if (loading || loadingSession) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="text-2xl font-semibold text-gray-800">Loading cafe details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-100">
        <div className="text-2xl text-red-800">Error: {error}</div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Cafe not found.
      </div>
    );
  }

  const isOwner = session && session.isLoggedIn && session.id === cafe.userId;

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold text-gray-900">{cafe.name}</h1>
            {isOwner && (
              <div className="flex space-x-4">
                <Link href={`/cafes/${id}/edit`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Edit className="-ml-1 mr-2 h-5 w-5" />
                  Edit
                </Link>
                <button onClick={handleDelete} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <Trash2 className="-ml-1 mr-2 h-5 w-5" />
                  Delete
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-6">{cafe.address}</p>
          
          {cafe.photos.length > 0 && (
            <div className="mb-8">
              <img 
                src={cafe.photos[0].url} 
                alt={`Photo of ${cafe.name}`}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {cafe.description && (
                <p className="text-gray-800 mb-6">{cafe.description}</p>
              )}
              <div className="flex items-center mb-8">
                <span className="text-xl font-semibold mr-3">Average Rating:</span>
                {renderStars(cafe.averageRating)}
                <span className="ml-3 text-gray-700 text-lg">
                  ({cafe.averageRating.toFixed(1)} / 5.0)
                </span>
              </div>

              <hr className="my-8" />

              <div>
                <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                {cafe.reviews.length > 0 ? (
                  <div className="space-y-8">
                    {cafe.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-300 pb-6">
                        <div className="flex items-center mb-3">
                          {renderStars(review.overallRating)}
                          <span className="ml-3 text-gray-800 font-semibold">
                            {review.overallRating.toFixed(1)} / 5.0
                          </span>
                        </div>
                        <p className="text-gray-800 mb-4">{review.text}</p>
                        <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-2">
                          {review.locationRating > 0 && <p><strong>Location:</strong> {review.locationRating} / 5</p>}
                          {review.priceRating > 0 && <p><strong>Price:</strong> {review.priceRating} / 5</p>}
                          {review.coffeeRating > 0 && <p><strong>Coffee:</strong> {review.coffeeRating} / 5</p>}
                          {review.bakeryRating > 0 && <p><strong>Bakery:</strong> {review.bakeryRating} / 5</p>}
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                          By {review.user.email} on{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet. Be the first!</p>
                )}
                <div className="mt-8">
                  <Link
                    href={`/cafes/${id}/add-review`}
                    className="inline-block bg-teal-600 text-white py-3 px-6 rounded-full hover:bg-teal-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Add a Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
