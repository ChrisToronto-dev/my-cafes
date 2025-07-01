"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, MapPin, FileText, PlusCircle, Camera, UploadCloud } from 'lucide-react';
import Header from '@/components/Header';
import { z } from 'zod';
import { useSession } from '@/lib/sessionContext'; // Assuming a session context exists

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
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading user session...</p>
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
      setValidationErrors((prev) => ({ ...prev, photo: undefined })); // Clear photo error on change
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const formDataForValidation = {
      name,
      address,
      description,
      photo,
    };

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
    <div className="min-h-screen bg-gray-200">
      <Header />

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add a New Cafe</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Cafe Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Building className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setValidationErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder="e.g., The Daily Grind"
                    />
                  </div>
                  {validationErrors.name && <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setValidationErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder="123 Main St, Anytown, USA"
                    />
                  </div>
                  {validationErrors.address && <p className="mt-2 text-sm text-red-600">{validationErrors.address}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute top-3 left-0 flex items-center pl-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setValidationErrors((prev) => ({ ...prev, description: undefined }));
                      }}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder="A cozy spot with great coffee and free Wi-Fi."
                    />
                  </div>
                  {validationErrors.description && <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cafe Photo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {preview ? (
                      <img src={preview} alt="Cafe preview" className="mx-auto h-48 w-auto rounded-md" />
                    ) : (
                      <>
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {preview && (
                  <div className="text-center mt-2">
                     <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                      >
                        <span>Change Photo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                      </label>
                  </div>
                )}
                {validationErrors.photo && <p className="mt-2 text-sm text-red-600">{validationErrors.photo}</p>}
              </div>
            </div>

            {formError && (
              <div className="rounded-md bg-red-100 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{formError}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-500 transition-transform hover:scale-105"
              >
                <UploadCloud className="-ml-1 mr-3 h-5 w-5" />
                {submitting ? 'Submitting...' : 'Submit Cafe'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

