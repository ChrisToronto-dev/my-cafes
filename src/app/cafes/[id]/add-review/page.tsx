"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Star, UploadCloud } from "lucide-react";
import Header from "@/components/Header";
import { z } from 'zod';
import { useSession } from '@/lib/sessionContext'; // Assuming a session context exists

const reviewSchema = z.object({
  text: z.string().min(10, "Review must be at least 10 characters.").max(500, "Review must be at most 500 characters."),
  overallRating: z.number().min(0).max(5),
  locationRating: z.number().min(0).max(5),
  priceRating: z.number().min(0).max(5),
  coffeeRating: z.number().min(0).max(5),
  bakeryRating: z.number().min(0).max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function AddReviewPage() {
  const router = useRouter();
  const params = useParams();
  const cafeId = params.id as string;

  const [text, setText] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [locationRating, setLocationRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [coffeeRating, setCoffeeRating] = useState(0);
  const [bakeryRating, setBakeryRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({});
  const { session, loading: loadingSession } = useSession();

  useEffect(() => {
    if (!loadingSession && (!session || !session.isLoggedIn)) {
      router.push('/login');
    }
  }, [session, loadingSession, router]);

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading user session...</p>
      </div>
    );
  }

  useEffect(() => {
    const ratings = [locationRating, priceRating, coffeeRating, bakeryRating];
    const validRatings = ratings.filter((r) => r > 0);
    if (validRatings.length > 0) {
      const average = validRatings.reduce((acc, r) => acc + r, 0) / validRatings.length;
      setOverallRating(parseFloat(average.toFixed(1))); // Round to 1 decimal place
    } else {
      setOverallRating(0);
    }
  }, [locationRating, priceRating, coffeeRating, bakeryRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const formDataForValidation = {
      text,
      overallRating,
      locationRating,
      priceRating,
      coffeeRating,
      bakeryRating,
    };

    const result = reviewSchema.safeParse(formDataForValidation);

    if (!result.success) {
      const newErrors: Partial<Record<keyof ReviewFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          newErrors[err.path[0] as keyof ReviewFormData] = err.message;
        }
      });
      setValidationErrors(newErrors);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("text", result.data.text);
    formData.append("overallRating", String(result.data.overallRating));
    formData.append("locationRating", String(result.data.locationRating));
    formData.append("priceRating", String(result.data.priceRating));
    formData.append("coffeeRating", String(result.data.coffeeRating));
    formData.append("bakeryRating", String(result.data.bakeryRating));

    try {
      const response = await fetch(`/api/cafes/${cafeId}/reviews`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      router.push(`/cafes/${cafeId}`);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingStars = (rating: number, setRating?: (r: number) => void, fieldName?: keyof ReviewFormData) => {
    const isInteractive = !!setRating;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 ${isInteractive ? "cursor-pointer transition-colors" : ""} ${star <= rating ? "text-yellow-400" : `text-gray-400 ${isInteractive ? "hover:text-yellow-300" : ""}`}`}
            fill="currentColor"
            onClick={isInteractive ? () => {
              setRating(star);
              if (fieldName) {
                setValidationErrors((prev) => ({ ...prev, [fieldName]: undefined }));
              }
            } : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add a Review</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-800 mb-2">Overall Rating</label>
                  {renderRatingStars(overallRating)}
                </div>
                 <div>
                  <label htmlFor="text" className="block text-lg font-medium text-gray-800 mb-2">Your Review</label>
                  <textarea
                    id="text"
                    rows={5}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setValidationErrors((prev) => ({ ...prev, text: undefined }));
                    }}
                    placeholder="Share your experience..."
                  ></textarea>
                  {validationErrors.text && <p className="mt-2 text-sm text-red-600">{validationErrors.text}</p>}
                </div>
              </div>
              <div className="space-y-6 bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">Detailed Ratings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  {renderRatingStars(locationRating, setLocationRating, 'locationRating')}
                  {validationErrors.locationRating && <p className="mt-2 text-sm text-red-600">{validationErrors.locationRating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  {renderRatingStars(priceRating, setPriceRating, 'priceRating')}
                  {validationErrors.priceRating && <p className="mt-2 text-sm text-red-600">{validationErrors.priceRating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coffee</label>
                  {renderRatingStars(coffeeRating, setCoffeeRating, 'coffeeRating')}
                  {validationErrors.coffeeRating && <p className="mt-2 text-sm text-red-600">{validationErrors.coffeeRating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bakery</label>
                  {renderRatingStars(bakeryRating, setBakeryRating, 'bakeryRating')}
                  {validationErrors.bakeryRating && <p className="mt-2 text-sm text-red-600">{validationErrors.bakeryRating}</p>}
                </div>
              </div>
            </div>

            {formError && <p className="text-red-600 text-sm text-center">{formError}</p>}

            <div className="flex justify-end pt-5">
              <button
                type="submit"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-500 transition-transform hover:scale-105"
                disabled={loading}
              >
                <UploadCloud className="-ml-1 mr-3 h-5 w-5" />
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}