'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLoading } from '@/context/LoadingContext';

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
}

interface AddressForm {
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  kecamatan: string;
  kodePos: string;
  alamatLengkap: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'e-wallet';
  accountNumber?: string;
  accountName: string;
  logo: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: '',
    phoneNumber: '',
    province: '',
    city: '',
    kecamatan: '',
    kodePos: '',
    alamatLengkap: '',
  });
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const { setIsLoading } = useLoading();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mandiri',
      name: 'Bank Mandiri',
      type: 'bank',
      accountNumber: process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER || '0987654321',
      accountName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'Furniture Lab',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/2560px-Bank_Mandiri_logo_2016.svg.png',
    },
    {
      id: 'bni',
      name: 'Bank BNI',
      type: 'bank',
      accountNumber: process.env.NEXT_PUBLIC_BANK_BNI_NUMBER || '1234567890',
      accountName: process.env.NEXT_PUBLIC_BANK_BNI_NAME || 'Furniture Lab',
      logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/2560px-BNI_logo.svg.png',
    },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Get checkout data from sessionStorage
        const checkoutDataStr = sessionStorage.getItem('checkoutData');
        if (!checkoutDataStr) {
          router.push('/products');
          return;
        }

        const checkoutData = JSON.parse(checkoutDataStr);
        const { items } = checkoutData;
        
        if (!items || items.length === 0) {
          router.push('/products');
          return;
        }

        const item = items[0];
        setQuantity(item.quantity);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products?id=${params.id}`, { 
          cache: 'no-store',
          next: { revalidate: 60 }
        });
        if (!res.ok) throw new Error('Failed to fetch product');
        const products = await res.json();
        if (Array.isArray(products)) {
          const foundProduct = products.find((p: Product) => p.id === params.id);
          if (!foundProduct) throw new Error('Product not found');
          setProduct(foundProduct);
        } else if (products && products.id === params.id) {
          setProduct(products);
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router, setIsLoading]);

  useEffect(() => {
    if (paymentProofUrl && !isPaymentModalOpen) {
      handlePaymentComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentProofUrl, isPaymentModalOpen]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!paymentProof) {
      alert('Silakan pilih file bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', paymentProof);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload payment proof');
      }

      const data = await response.json();
      setPaymentProofUrl(data.url);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      alert('Gagal mengupload bukti pembayaran. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', addressForm);
    console.log('Selected Payment:', selectedPayment);
    console.log('Product:', product);
    
    if (!selectedPayment || !product) {
      console.log('Missing payment or product');
      alert('Silakan lengkapi semua data dan pilih metode pembayaran');
      return;
    }

    // Show payment modal first
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async () => {
    if (!paymentProofUrl || !product) {
      console.log('Missing payment proof or product');
      alert('Silakan upload bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating address with data:', {
        fullName: addressForm.fullName,
        phoneNumber: addressForm.phoneNumber,
        province: addressForm.province,
        city: addressForm.city,
        kecamatan: addressForm.kecamatan,
        kodePos: addressForm.kodePos,
        alamatLengkap: addressForm.alamatLengkap,
      });

      // First create the address
      const addressResponse = await fetch('/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: addressForm.fullName,
          phoneNumber: addressForm.phoneNumber,
          province: addressForm.province,
          city: addressForm.city,
          kecamatan: addressForm.kecamatan,
          kodePos: addressForm.kodePos,
          alamatLengkap: addressForm.alamatLengkap,
        }),
      });

      if (!addressResponse.ok) {
        const errorData = await addressResponse.json();
        console.error('Address creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create address');
      }

      const address = await addressResponse.json();
      console.log('Address created:', address);

      // Then create the checkout
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          addressId: address.id,
          paymentProof: paymentProofUrl,
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error('Checkout creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout');
      }

      const checkout = await checkoutResponse.json();
      console.log('Checkout created:', checkout);
      
      sessionStorage.removeItem('checkoutData');
      router.push(`/orders/${checkout.id}`);
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#472D2D] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const shipping = 15000; // Example shipping cost
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <ol className="flex space-x-2">
            <li><Link href="/">Beranda</Link> /</li>
            <li><Link href="/products">Produk</Link> /</li>
            <li><Link href={`/products/${product.id}`}>{product.name}</Link> /</li>
            <li className="text-gray-700 font-semibold">Checkout</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#472D2D] mb-6">Alamat Pengiriman</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={addressForm.fullName}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={addressForm.phoneNumber}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="alamatLengkap" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  id="alamatLengkap"
                  name="alamatLengkap"
                  value={addressForm.alamatLengkap}
                  onChange={handleAddressChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  placeholder="Contoh: Jl. Contoh No. 123, RT 01/RW 02"
                  required
                />
              </div>

              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={addressForm.province}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Kota
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  id="kecamatan"
                  name="kecamatan"
                  value={addressForm.kecamatan}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="kodePos" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  id="kodePos"
                  name="kodePos"
                  value={addressForm.kodePos}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#472D2D] focus:border-transparent"
                  required
                />
              </div>
            </form>
          </div>

          {/* Payment and Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#472D2D] mb-4">Ringkasan Pesanan</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">Jumlah: {quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(product.price * quantity)}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pengiriman</span>
                  <span className="text-gray-900">{new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(shipping)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#472D2D]">{new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#472D2D] mb-4">Metode Pembayaran</h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-[#472D2D] bg-[#472D2D]/5'
                        : 'border-gray-200 hover:border-[#472D2D]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-12 h-12">
                        <Image
                          src={method.logo}
                          alt={method.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        {method.type === 'bank' && (
                          <p className="text-sm text-gray-500">
                            {method.accountNumber} a.n. {method.accountName}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Proof Modal */}
            {isPaymentModalOpen && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-[#472D2D] mb-4">Upload Bukti Pembayaran</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePaymentProofChange}
                        className="w-full"
                      />
                    </div>
                    {paymentProof && (
                      <div className="relative w-full h-48">
                        <Image
                          src={URL.createObjectURL(paymentProof)}
                          alt="Payment proof preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleUploadPaymentProof}
                        disabled={!paymentProof || isUploading}
                        className="px-4 py-2 bg-[#472D2D] text-white rounded-md hover:bg-[#382525] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? 'Mengupload...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <button
          onClick={handleSubmit}
          disabled={!!paymentProofUrl}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
            paymentProofUrl
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-[#472D2D] hover:bg-[#382525] text-white'
          }`}
        >
          {paymentProofUrl ? (
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Pembayaran Berhasil</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Bayar Sekarang</span>
            </div>
          )}
        </button>
        {!paymentProofUrl && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Pembayaran melalui Bank Mandiri atau Bank BNI
          </p>
        )}
      </div>
    </main>
  );
} 