'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface AddressForm {
  id?: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  provinceId: string;
  city: string;
  cityId: string;
  kecamatan: string;
  kecamatanId: string;
  kodePos: string;
  alamatLengkap: string;
  isManualProvince: boolean;
  isManualCity: boolean;
  isManualDistrict: boolean;
}

interface Location {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'e-wallet';
  accountNumber?: string;
  accountName: string;
  logo: string;
}

export default function CartCheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: '',
    phoneNumber: '',
    province: '',
    provinceId: '',
    city: '',
    cityId: '',
    kecamatan: '',
    kecamatanId: '',
    kodePos: '',
    alamatLengkap: '',
    isManualProvince: false,
    isManualCity: false,
    isManualDistrict: false,
  });
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState({
    provinces: false,
    cities: false,
    districts: false,
  });

  // Cache for location data
  const locationCache = {
    provinces: new Map<string, Location[]>(),
    cities: new Map<string, Location[]>(),
    districts: new Map<string, Location[]>(),
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mandiri',
      name: 'Bank Mandiri',
      type: 'bank',
      accountNumber: process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER || '0987654321',
      accountName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'Furniture Lab',
      logo: '/banks/mandiri.png',
    },
    {
      id: 'bni',
      name: 'Bank BNI',
      type: 'bank',
      accountNumber: process.env.NEXT_PUBLIC_BANK_BNI_NUMBER || '1234567890',
      accountName: process.env.NEXT_PUBLIC_BANK_BNI_NAME || 'Furniture Lab',
      logo: '/banks/bni.png',
    },
  ];

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsInitialLoading(true);
        const response = await fetch('/api/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        const data = await response.json();
        
        // Fetch products in parallel
        const productIds = data.map((item: CartItem) => item.productId);
        const uniqueProductIds = Array.from(new Set(productIds)); // Remove duplicates

        const productsRes = await fetch(`/api/products?ids=${uniqueProductIds.join(',')}`, { 
          cache: 'force-cache' // Enable caching for product data
        });
        
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const fetchedProducts = await productsRes.json();
        if (!Array.isArray(fetchedProducts)) {
          throw new Error('Invalid response format');
        }

        // Map products to cart items
        const enrichedCartItems = data.map((item: CartItem) => {
          const product = fetchedProducts.find((p: Product) => p.id === item.productId);
          return {
            ...item,
            product: {
              ...product,
              images: product?.images || ['/placeholder.png']
            }
          };
        });

        setCartItems(enrichedCartItems);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        router.push('/cart');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const fetchProvinces = useCallback(async () => {
    // Check cache first
    const cachedProvinces = locationCache.provinces.get('all');
    if (cachedProvinces) {
      setProvinces(cachedProvinces);
      return;
    }

    setLoadingLocations(prev => ({ ...prev, provinces: true }));
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const res = await fetch('/api/emsifa?type=province', {
          cache: 'force-cache',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch provinces: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProvinces(data);
          locationCache.provinces.set('all', data);
          return;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(`Error fetching provinces (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          toast.error('Gagal memuat data provinsi. Silakan coba lagi nanti.');
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }, [locationCache.provinces]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const fetchCities = async (provinceId: string) => {
    const cachedCities = locationCache.cities.get(provinceId);
    if (cachedCities) {
      setCities(cachedCities);
      return;
    }

    setLoadingLocations(prev => ({ ...prev, cities: true }));
    try {
      const res = await fetch(`/api/emsifa?type=city&id=${provinceId}`, {
        cache: 'force-cache'
      });
      if (!res.ok) throw new Error('Failed to fetch cities');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCities(data);
        locationCache.cities.set(provinceId, data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingLocations(prev => ({ ...prev, cities: false }));
    }
  };

  const fetchDistricts = async (cityId: string) => {
    const cachedDistricts = locationCache.districts.get(cityId);
    if (cachedDistricts) {
      setDistricts(cachedDistricts);
      return;
    }

    setLoadingLocations(prev => ({ ...prev, districts: true }));
    try {
      const res = await fetch(`/api/emsifa?type=district&id=${cityId}`, {
        cache: 'force-cache'
      });
      if (!res.ok) throw new Error('Failed to fetch districts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDistricts(data);
        locationCache.districts.set(cityId, data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingLocations(prev => ({ ...prev, districts: false }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'provinceId') {
      if (value === 'manual') {
        setAddressForm(prev => ({
          ...prev,
          provinceId: '',
          province: '',
          isManualProvince: true,
          city: '',
          cityId: '',
          kecamatan: '',
          kecamatanId: '',
          isManualCity: false,
          isManualDistrict: false,
        }));
        setCities([]);
        setDistricts([]);
      } else {
        const province = provinces.find(p => p.id === value);
        setAddressForm(prev => ({
          ...prev,
          provinceId: value,
          province: province?.name || '',
          isManualProvince: false,
          city: '',
          cityId: '',
          kecamatan: '',
          kecamatanId: '',
          isManualCity: false,
          isManualDistrict: false,
        }));
        setCities([]);
        setDistricts([]);
        if (value) fetchCities(value);
      }
    } else if (name === 'cityId') {
      if (value === 'manual') {
        setAddressForm(prev => ({
          ...prev,
          cityId: '',
          city: '',
          isManualCity: true,
          kecamatan: '',
          kecamatanId: '',
          isManualDistrict: false,
        }));
        setDistricts([]);
      } else {
        const city = cities.find(c => c.id === value);
        setAddressForm(prev => ({
          ...prev,
          cityId: value,
          city: city?.name || '',
          isManualCity: false,
          kecamatan: '',
          kecamatanId: '',
          isManualDistrict: false,
        }));
        setDistricts([]);
        if (value) fetchDistricts(value);
      }
    } else if (name === 'kecamatanId') {
      if (value === 'manual') {
        setAddressForm(prev => ({
          ...prev,
          kecamatanId: '',
          kecamatan: '',
          isManualDistrict: true,
        }));
      } else {
        const district = districts.find(d => d.id === value);
        setAddressForm(prev => ({
          ...prev,
          kecamatanId: value,
          kecamatan: district?.name || '',
          isManualDistrict: false,
        }));
      }
    } else {
      setAddressForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPaymentProof(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPaymentProofPreview(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Mohon upload file gambar (PNG, JPG, atau GIF)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPaymentProof(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPaymentProofPreview(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Mohon upload file gambar (PNG, JPG, atau GIF)');
      }
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedBank || !paymentProof) {
      alert('Pilih bank dan upload bukti pembayaran');
      return;
    }

    try {
      setIsSubmittingPayment(true);
      setShowPaymentModal(false);

      // Create address first
      const addressData = {
        fullName: addressForm.fullName,
        phoneNumber: addressForm.phoneNumber,
        province: addressForm.province,
        city: addressForm.city,
        kecamatan: addressForm.kecamatan,
        kodePos: addressForm.kodePos,
        alamatLengkap: addressForm.alamatLengkap,
      };

      const createAddressRes = await fetch('/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!createAddressRes.ok) {
        const error = await createAddressRes.json();
        throw new Error(error.error || 'Gagal membuat alamat');
      }

      const addressResponse = await createAddressRes.json();

      if (!addressResponse || !addressResponse.id) {
        throw new Error('Response alamat tidak valid');
      }

      // Create checkout from cart items
      const checkoutPayload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        addressId: addressResponse.id,
      };

      const createCheckoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutPayload),
      });

      if (!createCheckoutRes.ok) {
        const error = await createCheckoutRes.json();
        throw new Error(error.error || 'Gagal membuat checkout');
      }

      const checkoutResponse = await createCheckoutRes.json();

      if (!checkoutResponse || !checkoutResponse.checkout || !checkoutResponse.checkout.id) {
        throw new Error('Response checkout tidak valid');
      }

      // Upload payment proof
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);
      formData.append('bank', selectedBank);

      const res = await fetch(`/api/checkout/${checkoutResponse.checkout.id}/payment`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal mengupload bukti pembayaran');
      }

      // Clear cart after successful checkout
      await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengupload bukti pembayaran');
      setShowPaymentModal(true);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/orders');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-16 mt-22">
      {isInitialLoading ? (
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#472D2D] mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat halaman checkout...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-8">
            <ol className="flex space-x-2">
              <li><Link href="/">Beranda</Link> /</li>
              <li><Link href="/cart">Keranjang</Link> /</li>
              <li className="text-gray-700 font-semibold">Checkout</li>
            </ol>
          </nav>
          
          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#472D2D] mb-4">Cara Pembayaran</h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-start gap-2">
                <span className="font-semibold text-[#472D2D]">1.</span>
                Isi form alamat pengiriman dengan lengkap
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-[#472D2D]">2.</span>
                Pilih metode pembayaran yang tersedia
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-[#472D2D]">3.</span>
                Lakukan pembayaran sesuai nominal yang tertera
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-[#472D2D]">4.</span>
                Klik tombol &quot;Bayar Sekarang&quot; dan upload bukti pembayaran
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-[#472D2D]">5.</span>
                Pantau status pesanan melalui halaman pesanan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Address Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#472D2D] mb-6">Alamat Pengiriman</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={addressForm.fullName}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={addressForm.phoneNumber}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="provinceId" className="block text-sm font-medium text-gray-700">
                      Provinsi
                    </label>
                    {addressForm.isManualProvince ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="province"
                          name="province"
                          value={addressForm.province}
                          onChange={handleAddressChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                          required
                          placeholder="Provinsi"
                        />
                        <button
                          type="button"
                          onClick={() => setAddressForm(prev => ({ ...prev, isManualProvince: false }))}
                          className="mt-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                          Daftar
                        </button>
                      </div>
                    ) : (
                      <select
                        id="provinceId"
                        name="provinceId"
                        value={addressForm.provinceId}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                        required
                      >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                        <option value="manual">Lainnya (Isi Manual)</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cityId" className="block text-sm font-medium text-gray-700">
                      Kota/Kabupaten
                    </label>
                    {addressForm.isManualCity ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                          required
                          placeholder="Kota/Kabupaten"
                        />
                        <button
                          type="button"
                          onClick={() => setAddressForm(prev => ({ ...prev, isManualCity: false }))}
                          className="mt-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                          Daftar
                        </button>
                      </div>
                    ) : (
                      <select
                        id="cityId"
                        name="cityId"
                        value={addressForm.cityId}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                        required
                        disabled={!addressForm.provinceId && !addressForm.isManualProvince}
                      >
                        <option value="">Pilih Kota/Kabupaten</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                        <option value="manual">Lainnya (Isi Manual)</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="kecamatanId" className="block text-sm font-medium text-gray-700">
                      Kecamatan
                    </label>
                    {addressForm.isManualDistrict ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="kecamatan"
                          name="kecamatan"
                          value={addressForm.kecamatan}
                          onChange={handleAddressChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                          required
                          placeholder="Masukkan nama kecamatan"
                        />
                        <button
                          type="button"
                          onClick={() => setAddressForm(prev => ({ ...prev, isManualDistrict: false }))}
                          className="mt-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                          Daftar
                        </button>
                      </div>
                    ) : (
                      <select
                        id="kecamatanId"
                        name="kecamatanId"
                        value={addressForm.kecamatanId}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                        required
                        disabled={!addressForm.cityId && !addressForm.isManualCity}
                      >
                        <option value="">Pilih Kecamatan</option>
                        {districts.map(district => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                        <option value="manual">Lainnya (Isi Manual)</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label htmlFor="kodePos" className="block text-sm font-medium text-gray-700">
                      Kode Pos
                    </label>
                    <input
                      type="number"
                      id="kodePos"
                      name="kodePos"
                      value={addressForm.kodePos}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="alamatLengkap" className="block text-sm font-medium text-gray-700">
                    Alamat Lengkap
                  </label>
                  <textarea
                    id="alamatLengkap"
                    name="alamatLengkap"
                    value={addressForm.alamatLengkap}
                    onChange={handleAddressChange}
                    rows={6}
                    placeholder="Contoh: Jl. Imam Bonjol No. 123, Kota Surabaya, Jawa Timur"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#472D2D] focus:ring-[#472D2D] text-base px-4 py-[7px] resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#472D2D] mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-md"
                          unoptimized={item.product.images[0]?.startsWith('https://res.cloudinary.com')}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Jumlah: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-[#472D2D]">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#472D2D] mb-4">Metode Pembayaran</h2>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleBankSelect(method.id)}
                      className={`cursor-pointer w-full p-4 border rounded-lg flex items-center space-x-4 ${
                        selectedBank === method.id
                          ? 'border-[#472D2D]'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="relative w-12 h-12">
                        <Image
                          src={method.logo}
                          alt={method.name}
                          width={48}
                          height={48}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        {method.accountNumber && (
                          <p className="text-sm text-gray-500">
                            {method.accountNumber}    <span className='mx-1'>a.n.</span>   {method.accountName}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={!selectedBank}
                className={`cursor-pointer w-full px-4 py-3 bg-[#472D2D] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {isSubmittingPayment && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#472D2D] mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-[#472D2D] mb-2">
              Memproses Pembayaran
            </h3>
            <p className="text-gray-600">
              Mohon tunggu sebentar, kami sedang memproses pembayaran Anda...
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[#472D2D] mb-4">
              Upload Bukti Pembayaran
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bukti Pembayaran
                </label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#472D2D] transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center w-full">
                    {paymentProofPreview ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={paymentProofPreview}
                          alt="Preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                        <button
                          onClick={() => {
                            setPaymentProof(null);
                            setPaymentProofPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex flex-col items-center gap-2">
                          <label
                            htmlFor="payment-proof"
                            className="cursor-pointer bg-[#472D2D] text-white px-4 py-2 rounded-lg hover:bg-[#472D2D]/90 transition-colors"
                          >
                            Pilih File
                            <input
                              id="payment-proof"
                              name="payment-proof"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handlePaymentProofChange}
                            />
                          </label>
                          <p className="text-sm text-gray-500">atau</p>
                          <p className="text-sm text-gray-500">Drag & drop file gambar di sini</p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, GIF sampai 10MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Batal
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!paymentProof}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                    paymentProof
                      ? 'bg-[#472D2D] hover:bg-[#472D2D]/90'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#472D2D] mb-2">
              Pembayaran Berhasil
            </h3>
            <p className="text-gray-600 mb-6">
              Terima kasih telah melakukan pembayaran. Pesanan Anda akan diproses setelah pembayaran dikonfirmasi. Silakan transfer sesuai nominal yang tertera.
            </p>
            <button
              onClick={handleSuccessModalClose}
              className="w-full px-4 py-2 bg-[#472D2D] text-white rounded-lg font-medium hover:bg-[#472D2D]/90"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {loadingLocations.provinces && (
        <div className="text-center py-4">
          <span>Loading provinces...</span>
        </div>
      )}
      {loadingLocations.cities && (
        <div className="text-center py-4">
          <span>Loading cities...</span>
        </div>
      )}
      {loadingLocations.districts && (
        <div className="text-center py-4">
          <span>Loading districts...</span>
        </div>
      )}
    </main>
  );
} 