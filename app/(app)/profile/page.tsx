'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
// Hapus Navigasi
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Save, Download, Upload, Image as ImageIcon } from 'lucide-react';
// Impor Cloudinary
import { CldUploadButton } from 'next-cloudinary';
// Impor type untuk hasil upload
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { backupData, importData, fetchFinanceData } = useFinance();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    // Hapus email, karena API tidak mendukung perubahannya
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  // --- BARU: Handler untuk sukses upload Cloudinary ---
  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const info = result.info as { secure_url: string };
    if (info && info.secure_url) {
      setFormData({ ...formData, avatarUrl: info.secure_url });
      toast({
        title: 'Image Uploaded',
        description: 'Click "Save Changes" to apply your new avatar.',
      });
      // Otomatis aktifkan mode edit jika gambar diubah
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!formData.fullName) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
        // Hanya kirim fullName dan avatarUrl
        const success = await updateProfile({
            fullName: formData.fullName,
            avatarUrl: formData.avatarUrl || null, 
        });

        if (success) {
            toast({ title: 'Success', description: 'Profile updated successfully' });
            setIsEditing(false);
        } else {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
        }
    } catch(e) {
        toast({ title: 'Error', description: 'Failed to connect to the server.', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        avatarUrl: user.avatarUrl || '',
      });
    }
    setIsEditing(false);
  };
  
  // ... (handler backup & import tetap sama) ...
  const handleBackup = async () => {
    try {
        toast({ title: 'Backup initiated', description: 'Preparing data for download...', duration: 2000 });
        await backupData();
        toast({ title: 'Backup Successful', description: 'Your backup has started downloading.' });
    } catch (e) {
        toast({ title: 'Backup Failed', description: 'Could not connect to server.', variant: 'destructive' });
    }
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImportLoading(true);
    try {
        await importData(file);
        toast({ title: 'Import Successful', description: 'Data successfully restored. Refreshing...' });
        await fetchFinanceData(); 
    } catch (e: any) {
        toast({ title: 'Import Failed', description: e.message || 'Error processing file.', variant: 'destructive' });
    } finally {
        setIsImportLoading(false);
        if (importInputRef.current) {
            importInputRef.current.value = '';
        }
    }
  };

  if (!user) return null;

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Avatar */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Avatar className="w-32 h-32 mb-4 border-4 border-black">
                  {/* Gunakan formData.avatarUrl untuk preview instan */}
                  <AvatarImage src={formData.avatarUrl || undefined} alt={formData.fullName} className="object-cover" />
                  <AvatarFallback className="bg-black text-white text-3xl">
                      {userInitials}
                  </AvatarFallback>
              </Avatar>
              {/* --- BARU: Tombol Upload Cloudinary --- */}
              <CldUploadButton
                options={{
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  maxFiles: 1,
                  cropping: true,
                  croppingAspectRatio: 1,
                }}
                // Ambil cloudName dan uploadPreset dari .env.local
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handleUploadSuccess}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                  // Render sebagai span agar CldUploadButton bisa mengontrolnya
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </CldUploadButton>
            </CardContent>
          </Card>

          {/* Card Info Akun */}
          <Card className="lg:col-span-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">Account Information</CardTitle>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-black disabled:opacity-60"
                />
              </div>

              {/* Email (Hanya Tampil, Tidak Bisa Diedit) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email} // Ambil langsung dari user context
                  disabled // Selalu nonaktif
                  className="border-2 border-black disabled:opacity-60 disabled:bg-gray-100"
                />
              </div>

              {/* Hapus Input Avatar URL */}

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Card Data Management (tetap sama) */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
                  <div className="space-y-1">
                      <p className="font-semibold">Backup Data (Export)</p>
                      <p className="text-sm text-gray-600">
                          Download semua data keuangan Anda sebagai file JSON untuk cadangan.
                      </p>
                  </div>
                  <Button
                      onClick={handleBackup}
                      className="text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                      <Download className="w-4 h-4 mr-2" />
                      Download Backup
                  </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                      <p className="font-semibold">Import Data (Restore)</p>
                      <p className="text-sm">
                          Mengimport data akan <strong className="font-bold">MENGHAPUS SEMUA DATA LAMA</strong> secara permanen.
                      </p>
                  </div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                      <Button
                          asChild
                          className="text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                          disabled={isImportLoading}
                      >
                          <span className="flex items-center">
                              {isImportLoading ? (
                                  <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Processing...
                                  </>
                              ) : (
                                  <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload & Restore
                                  </>
                              )}
                          </span>
                      </Button>
                      <Input
                          id="file-upload"
                          ref={importInputRef}
                          type="file"
                          accept=".json"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isImportLoading}
                      />
                  </label>
              </div>
          </CardContent>
        </Card>
        
        {/* Card About (tetap sama) */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">About This App</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Cash Map</strong> is a Progressive Web App (PWA) designed to
                help you manage your finances effectively.
              </p>
              <div className="pt-4">
                <p className="font-semibold text-black mb-2">Features:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Track income and expenses</li>
                  <li>Set daily budget limits and monitor spending</li>
                  <li>Create multiple savings goals with progress tracking</li>
                  <li>View comprehensive financial dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}