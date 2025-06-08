'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function FeedbackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim feedback');
      }

      setShowSuccessModal(true);
      setComment('');
      setRating(5);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim feedback. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen pt-40">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#472D2D] mb-4">Bagikan Feedback Anda</h1>
        <p className="text-gray-600">Kami menghargai pendapat Anda! Bantu kami berkembang dengan membagikan pengalaman Anda.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <label className="block text-lg font-medium text-[#472D2D] mb-4">Penilaian</label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-lg font-medium text-[#472D2D] mb-4">
            Feedback Anda
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
            rows={4}
            placeholder="Bagikan pendapat Anda dengan kami..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#472D2D] text-white py-3 px-6 rounded-lg hover:bg-[#382525] transition-colors disabled:opacity-50 text-lg font-medium"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Feedback'}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#472D2D] mb-2">
                Terima Kasih!
              </h3>
              <p className="text-gray-600 mb-6">
                Feedback Anda telah berhasil dikirim. Kami sangat menghargai masukan Anda.
              </p>
              <button
                onClick={handleCloseModal}
                className="w-full bg-[#472D2D] text-white py-3 px-6 rounded-lg hover:bg-[#382525] transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 