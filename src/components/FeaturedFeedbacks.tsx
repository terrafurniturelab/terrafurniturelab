'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export default function FeaturedFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch('/api/feedback');
        if (!response.ok) throw new Error('Failed to fetch feedbacks');
        const data = await response.json();
        setFeedbacks(data);
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Feedback</h3>
          <p className="text-gray-500">
            Jadilah yang pertama untuk memberikan feedback dan pengalaman Anda dengan Furniture Lab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="bg-white p-6 rounded-lg shadow-md"
        >
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
              <h3 className="font-semibold">{feedback.user.name || 'Anonymous'}</h3>
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
          <p className="mt-4 text-gray-600">{feedback.comment}</p>
        </div>
      ))}
    </div>
  );
} 