"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, MapPin, FileText, Camera, UploadCloud } from 'lucide-react';
import Header from '@/components/Header';
import { z } from 'zod';
import { useSession } from '@/lib/sessionContext';

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const cafeSchema = z.object({
  name: z.string().min(3, "Cafe name must be at least 3 characters."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  description: z.string().optional(),
  photo: z
    .any()
    .refine((file) => file instanceof File, "Photo is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 10MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .gif formats are supported."
    ),
});

type CafeFormData = z.infer<typeof cafeSchema>;

export default function AddCafePage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CafeFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { session, loading: loadingSession } = useSession();

  useEffect(() => {
    if (!loadingSession && (!session || !session.isLoggedIn)) {
      router.push('/login');
    }
  }, [session, loadingSession, router]);

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-foreground">Loading user session...</p>
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValidationErrors((prev) => ({ ...prev, photo: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const formDataForValidation = { name, address, description, photo };
    const result = cafeSchema.safeParse(formDataForValidation);

    if (!result.success) {
      const newErrors: Partial<Record<keyof CafeFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          newErrors[err.path[0] as keyof CafeFormData] = err.message;
        }
      });
      setValidationErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', result.data.name);
    formData.append('address', result.data.address);
    if (result.data.description) {
      formData.append('description', result.data.description);
    }
    formData.append('photo', result.data.photo);

    try {
      const response = await fetch('/api/cafes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add cafe');
      }

      router.push('/');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-6">Add a New Cafe</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">Cafe Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setValidationErrors(p => ({...p, name: undefined}))}}
                  className="block w-full rounded-md border-border pl-10 p-3 bg-background focus:border-primary focus:ring-primary"
                  placeholder="e.g., The Daily Grind"
                />
              </div>
              {validationErrors.name && <p className="mt-2 text-sm text-destructive">{validationErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-foreground">Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setValidationErrors(p => ({...p, address: undefined}))}}
                  className="block w-full rounded-md border-border pl-10 p-3 bg-background focus:border-primary focus:ring-primary"
                  placeholder="123 Main St, Anytown, USA"
                />
              </div>
              {validationErrors.address && <p className="mt-2 text-sm text-destructive">{validationErrors.address}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setValidationErrors(p => ({...p, description: undefined}))}}
                rows={4}
                className="mt-1 block w-full rounded-md border-border shadow-sm p-3 bg-background focus:border-primary focus:ring-primary"
                placeholder="A cozy spot with great coffee and free Wi-Fi."
              />
              {validationErrors.description && <p className="mt-2 text-sm text-destructive">{validationErrors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Cafe Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <img src={preview} alt="Cafe preview" className="mx-auto h-40 w-auto rounded-md" />
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="flex text-sm text-muted-foreground">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary/90">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
              {validationErrors.photo && <p className="mt-2 text-sm text-destructive">{validationErrors.photo}</p>}
            </div>

            {formError && <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">{formError}</p>}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
              >
                <UploadCloud className="-ml-1 mr-2 h-5 w-5" />
                {submitting ? 'Submitting...' : 'Submit Cafe'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}