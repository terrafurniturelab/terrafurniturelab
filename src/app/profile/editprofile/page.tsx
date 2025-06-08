'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('/user.png');
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
      }));
      const imagePath = session.user.image;
      setPreviewUrl(imagePath ? `${imagePath}` : '/user.png');
    }
  }, [session]);

  if (!session) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 2MB');
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Password baru tidak cocok');
          setIsLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error('Password baru minimal 6 karakter');
          setIsLoading(false);
          return;
        }
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate profil');
      }

      // Update session dengan data user yang baru
      const updatedSession = {
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          image: data.image,
        },
      };

      // Update session dan tunggu sampai selesai
      await update(updatedSession);

      // Update preview URL dengan gambar baru
      if (data.image) {
        setPreviewUrl(`/${data.image}`);
      }

      toast.success('Profil berhasil diupdate');
      
      // Tampilkan loading screen sebelum redirect
      setShowLoadingScreen(true);
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1200);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengupdate profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name !== session.user?.name || profileImage || formData.currentPassword || formData.newPassword) {
      if (window.confirm('Apakah Anda yakin ingin membatalkan perubahan?')) {
        router.push('/profile');
      }
    } else {
      router.push('/profile');
    }
  };

  if (showLoadingScreen) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container max-w-2xl mx-auto px-4 pt-30">
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-2xl font-bold text-[#472D2D]">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#472D2D]/10">
                  <Image
                    src={previewUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
                <div>
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      type="button"
                      className="bg-[#472D2D] hover:bg-[#472D2D]/90 text-white"
                      onClick={() => document.getElementById('profileImage')?.click()}
                    >
                      Ganti Foto Profil
                    </Button>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[#472D2D]">Nama</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-[#472D2D]/20 focus:border-[#472D2D]"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-medium text-[#472D2D] mb-4">Ubah Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-[#472D2D]">Password Saat Ini</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="border-[#472D2D]/20 focus:border-[#472D2D]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-[#472D2D]">Password Baru</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="border-[#472D2D]/20 focus:border-[#472D2D]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-[#472D2D]">Konfirmasi Password Baru</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="border-[#472D2D]/20 focus:border-[#472D2D]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-[#472D2D]/20 hover:border-[#472D2D] text-[#472D2D]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#472D2D] hover:bg-[#472D2D]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 