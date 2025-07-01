"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Star, MapPin } from "lucide-react";
import Header from "@/components/Header";

interface Photo {
  id: string;
  url: string;
  createdAt: string;
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  description: string;
  averageRating: number;
  photos: Photo[];
}

export default function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCafes() {
      try {
        const response = await fetch("/api/cafes");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCafes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCafes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="text-2xl font-semibold text-gray-800">Loading cafes...</div>
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

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      
      <main>
        <div className="relative bg-gray-700 text-white py-20 sm:py-24 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Find Your Perfect Cafe</h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Discover the best cafes, share your reviews, and connect with a community of coffee lovers.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cafes.map((cafe) => (
              <Link key={cafe.id} href={`/cafes/${cafe.id}`} className="block group">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                  {cafe.photos && cafe.photos.length > 0 ? (
                    <img 
                      src={cafe.photos[0].url} 
                      alt={cafe.name} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-600">
                      No Image
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{cafe.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm truncate">{cafe.address}</p>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <Star className="h-5 w-5 mr-1" fill="currentColor" />
                      <span className="font-bold text-lg">{cafe.averageRating.toFixed(1)}</span>
                      <span className="text-gray-600 ml-1">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {cafes.length === 0 && !loading && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">No Cafes Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">It looks like our collection is empty. Be the first to add a new cafe and share your favorite spot!</p>
              <Link href="/cafes/add" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform hover:scale-105">
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                Add Your Favorite Cafe
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

