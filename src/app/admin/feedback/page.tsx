'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  isFeatured: boolean;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      console.log('Fetching feedbacks...');
      const response = await fetch('/api/feedback?admin=true');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Gagal mengambil feedback: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received feedbacks:', data);
      setFeedbacks(data);
      setFeaturedCount(data.filter((f: Feedback) => f.isFeatured).length);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Gagal memuat feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (feedbackId: string, currentStatus: boolean) => {
    try {
      // Jika mencoba menampilkan feedback baru dan sudah ada 3 yang ditampilkan
      if (!currentStatus && featuredCount >= 3) {
        toast.error('Maksimal 3 feedback yang dapat ditampilkan. Silakan batalkan salah satu feedback yang ditampilkan terlebih dahulu.');
        return;
      }

      const response = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId,
          isFeatured: !currentStatus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      await fetchFeedbacks();
      toast.success(
        currentStatus 
          ? 'Feedback berhasil dibatalkan tampilannya' 
          : 'Feedback berhasil ditampilkan'
      );
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Gagal memperbarui feedback');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#472D2D]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#472D2D]">Kelola Feedback</h1>
          <p className="text-sm text-gray-600 mt-1">
            {featuredCount}/3 feedback ditampilkan di beranda
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className={`bg-white p-6 rounded-lg shadow-md border ${
              feedback.isFeatured ? 'border-yellow-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {feedback.user.image ? (
                  <Image
                    src={feedback.user.image}
                    alt={feedback.user.name || 'User'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl">
                      {feedback.user.name?.[0] || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-[#472D2D]">{feedback.user.name || 'Anonim'}</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleFeatured(feedback.id, feedback.isFeatured)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  feedback.isFeatured
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : featuredCount >= 3
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                disabled={!feedback.isFeatured && featuredCount >= 3}
                title={
                  !feedback.isFeatured && featuredCount >= 3
                    ? 'Maksimal 3 feedback yang dapat ditampilkan'
                    : feedback.isFeatured
                    ? 'Batalkan tampilkan di beranda'
                    : 'Tampilkan di beranda'
                }
              >
                {feedback.isFeatured ? 'Ditampilkan' : 'Tampilkan'}
              </button>
            </div>
            <p className="mt-4 text-gray-600">{feedback.comment}</p>
            <p className="mt-2 text-sm text-gray-500">
              {new Date(feedback.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 