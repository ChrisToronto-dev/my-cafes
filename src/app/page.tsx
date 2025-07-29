"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, Search, Wifi, Coffee, Wind } from "lucide-react";
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
  reviews: any[];
}

export default function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function fetchCafes() {
      try {
        const response = await fetch("/api/cafes");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCafes(data);
        setFilteredCafes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCafes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = cafes.filter((cafe) => {
      return (
        cafe.name.toLowerCase().includes(lowercasedQuery) ||
        cafe.address.toLowerCase().includes(lowercasedQuery)
      );
    });
    setFilteredCafes(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-2xl font-semibold text-foreground">Loading cafes...</div>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/coffee-pattern.svg')] opacity-10"></div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <Coffee className="h-16 w-16 mx-auto text-amber-600 mb-4" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
              Cafe Explorer
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 font-medium">
              Find your perfect cafe, share reviews, and connect with fellow coffee lovers
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <form className="relative bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl border border-white/50" onSubmit={handleSearch}>
                  <input 
                    type="text"
                    placeholder="Search by cafe name or region"
                    className="w-full px-6 py-4 bg-transparent text-lg placeholder-gray-500 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg">
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-1/4">
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24 border border-amber-100">
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                  <Coffee className="h-5 w-5 mr-2 text-amber-500" />
                  Filters
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <button key={rating} className="w-full flex items-center justify-between p-3 border border-amber-100 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors text-sm">
                          <div className="flex items-center">
                            <span className="mr-2">{rating}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Amenities</h4>
                    <div className="space-y-3">
                      <label className="flex items-center p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors">
                        <input type="checkbox" className="h-4 w-4 rounded border-amber-300 text-amber-500 focus:ring-amber-500 mr-3"/> 
                        <Wifi className="h-5 w-5 mr-2 text-amber-500"/> 
                        <span className="text-gray-700">Wi-Fi</span>
                      </label>
                      <label className="flex items-center p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors">
                        <input type="checkbox" className="h-4 w-4 rounded border-amber-300 text-amber-500 focus:ring-amber-500 mr-3"/> 
                        <Coffee className="h-5 w-5 mr-2 text-amber-500"/> 
                        <span className="text-gray-700">Specialty Coffee</span>
                      </label>
                      <label className="flex items-center p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors">
                        <input type="checkbox" className="h-4 w-4 rounded border-amber-300 text-amber-500 focus:ring-amber-500 mr-3"/> 
                        <Wind className="h-5 w-5 mr-2 text-amber-500"/> 
                        <span className="text-gray-700">Outdoor Seating</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="w-full lg:w-3/4">
              {searched && (
                <div className="mb-4">
                  <p className="text-lg font-semibold">
                    Found {filteredCafes.length} results for "{searchQuery}"
                  </p>
                </div>
              )}
              <div className="space-y-6">
                {filteredCafes.length > 0 ? (
                  filteredCafes.map((cafe) => (
                    <div key={cafe.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-amber-100">
                      <div className="flex flex-col md:flex-row">
                        {cafe.photos && cafe.photos.length > 0 ? (
                          <div className="relative w-full md:w-1/3 h-64 md:h-auto overflow-hidden">
                            <img 
                              src={cafe.photos[0].url} 
                              alt={cafe.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className="w-full md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                            <Coffee className="h-20 w-20 text-amber-300" />
                          </div>
                        )}
                        <div className="p-8 flex flex-col justify-between flex-grow">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300 mb-2">
                              <Link href={`/cafes/${cafe.id}`}>{cafe.name}</Link>
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mb-4">
                              <MapPin className="h-4 w-4 mr-2 text-amber-500" /> {cafe.address}
                            </p>
                            <p className="text-gray-700 leading-relaxed line-clamp-3">{cafe.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                              {cafe.reviews && cafe.reviews.length > 0 ? (
                                <>
                                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg px-4 py-2 rounded-xl shadow-lg">
                                    {cafe.averageRating.toFixed(1)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {cafe.averageRating >= 4.5 ? 'Excellent' : cafe.averageRating >= 4 ? 'Great' : cafe.averageRating >= 3 ? 'Good' : 'Average'}
                                    </p>
                                    <div className="flex text-amber-400">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.round(cafe.averageRating) ? 'fill-current' : ''}`} />
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">No reviews yet</p>
                              )}
                            </div>
                            <Link 
                              href={`/cafes/${cafe.id}`} 
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  searched && <p className="text-center text-gray-500">No results found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
