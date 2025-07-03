"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Star, UploadCloud } from "lucide-react";
import Header from "@/components/Header";
import { z } from 'zod';
import { useSession } from '@/lib/sessionContext';

const reviewSchema = z.object({
  text: z.string().min(10, "Review must be at least 10 characters.").max(500, "Review must be at most 500 characters."),
  overallRating: z.number().min(1, "Overall rating is required.").max(5),
  locationRating: z.number().min(1, "Location rating is required.").max(5),
  priceRating: z.number().min(1, "Price rating is required.").max(5),
  coffeeRating: z.number().min(1, "Coffee rating is required.").max(5),
  bakeryRating: z.number().min(1, "Bakery rating is required.").max(5),
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

  useEffect(() => {
    const ratings = [locationRating, priceRating, coffeeRating, bakeryRating].filter(r => r > 0);
    if (ratings.length > 0) {
      const average = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
      setOverallRating(parseFloat(average.toFixed(1)));
    } else {
      setOverallRating(0);
    }
  }, [locationRating, priceRating, coffeeRating, bakeryRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const formDataForValidation = { text, overallRating, locationRating, priceRating, coffeeRating, bakeryRating };
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

  const renderRatingStars = (rating: number, setRating: (r: number) => void, fieldName: keyof ReviewFormData) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-8 w-8 cursor-pointer transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
          fill="currentColor"
          onClick={() => { setRating(star); setValidationErrors(p => ({...p, [fieldName]: undefined}))}}
        />
      ))}
    </div>
  );

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-foreground">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-6">Write a Review</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-foreground">Your Review</label>
              <textarea
                id="text"
                rows={5}
                className="mt-1 block w-full border border-border rounded-md shadow-sm p-3 bg-background focus:ring-primary focus:border-primary"
                value={text}
                onChange={(e) => { setText(e.target.value); setValidationErrors(p => ({...p, text: undefined}))}}
                placeholder="Share your experience..."
              ></textarea>
              {validationErrors.text && <p className="mt-2 text-sm text-destructive">{validationErrors.text}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Detailed Ratings</h3>
                <div>
                  <label className="block text-sm font-medium text-foreground">Location</label>
                  {renderRatingStars(locationRating, setLocationRating, 'locationRating')}
                  {validationErrors.locationRating && <p className="mt-2 text-sm text-destructive">{validationErrors.locationRating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Price</label>
                  {renderRatingStars(priceRating, setPriceRating, 'priceRating')}
                  {validationErrors.priceRating && <p className="mt-2 text-sm text-destructive">{validationErrors.priceRating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Coffee</label>
                  {renderRatingStars(coffeeRating, setCoffeeRating, 'coffeeRating')}
                  {validationErrors.coffeeRating && <p className="mt-2 text-sm text-destructive">{validationErrors.coffeeRating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Bakery</label>
                  {renderRatingStars(bakeryRating, setBakeryRating, 'bakeryRating')}
                  {validationErrors.bakeryRating && <p className="mt-2 text-sm text-destructive">{validationErrors.bakeryRating}</p>}
                </div>
              </div>
              <div className="bg-secondary border border-border p-6 rounded-lg flex flex-col items-center justify-center">
                 <label className="block text-lg font-medium text-foreground mb-2">Overall Rating</label>
                 <div className="text-5xl font-bold text-primary">{overallRating.toFixed(1)}</div>
                 <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-6 w-6 ${i < Math.round(overallRating) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" />
                    ))}
                 </div>
                 {validationErrors.overallRating && <p className="mt-2 text-sm text-destructive">{validationErrors.overallRating}</p>}
              </div>
            </div>

            {formError && <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">{formError}</p>}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
                disabled={loading}
              >
                <UploadCloud className="-ml-1 mr-2 h-5 w-5" />
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
