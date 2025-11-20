'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Save, Download, Upload, Image as ImageIcon, AlertTriangle, ShieldCheck, Edit2, X } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
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

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const info = result.info as { secure_url: string };
    if (info && info.secure_url) {
      setFormData({ ...formData, avatarUrl: info.secure_url });
      toast({
        title: 'Image Uploaded',
        description: 'Click "Save Changes" to apply your new avatar.',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!formData.fullName) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
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
      <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Profile</h1>
            <p className="text-gray-500 font-medium mt-2">Manage your account settings and data</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Status */}
            <div className="space-y-8">
                <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] overflow-hidden bg-white text-center">
                    <CardContent className="pt-10 pb-8 px-6">
                        <div className="relative inline-block">
                             <Avatar className="w-32 h-32 mb-4 border-4 border-black shadow-sm">
                                <AvatarImage src={formData.avatarUrl || undefined} alt={formData.fullName} className="object-cover" />
                                <AvatarFallback className="bg-[#D2F65E] text-black text-3xl font-black border-2 border-black">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                             {/* Badge */}
                             <div className="absolute bottom-2 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white">
                                 PRO
                             </div>
                        </div>
                        
                        <h2 className="text-xl font-black mt-2">{user.fullName}</h2>
                        <p className="text-gray-500 text-sm font-medium mb-6">{user.email}</p>

                        <CldUploadButton
                            options={{
                            sources: ['local', 'url', 'camera'],
                            multiple: false,
                            maxFiles: 1,
                            cropping: true,
                            croppingAspectRatio: 1,
                            }}
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            onSuccess={handleUploadSuccess}
                            className="w-full"
                        >
                            <Button
                            variant="outline"
                            className="w-full h-12 rounded-full border-2 border-black hover:bg-black hover:text-white font-bold transition-colors"
                            >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Change Avatar
                            </Button>
                        </CldUploadButton>
                    </CardContent>
                </Card>
                
                <div className="bg-[#D2F65E] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] p-6 flex items-center gap-4">
                     <div className="bg-black p-3 rounded-full text-white border-2 border-black">
                         <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="font-black text-lg leading-tight text-black">Account Status</p>
                         <p className="text-sm font-bold text-black/70">Active & Secure</p>
                     </div>
                </div>
            </div>

            {/* Right Column: Edit Form & Data Management */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Edit Profile Form */}
                <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] bg-white">
                    <CardHeader className="px-8 pt-8 pb-4 border-b-2 border-gray-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-black">Personal Info</CardTitle>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                size="sm"
                                variant="ghost"
                                className="h-10 w-10 rounded-full hover:bg-gray-100 text-black border-2 border-transparent hover:border-black transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                                <User className="w-4 h-4" /> Full Name
                                </Label>
                                <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                disabled={!isEditing}
                                className="h-12 border-2 border-black rounded-xl font-bold disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                                <Mail className="w-4 h-4" /> Email Address
                                </Label>
                                <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="h-12 border-2 border-gray-200 bg-gray-50 rounded-xl text-gray-500 font-bold cursor-not-allowed"
                                />
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 h-12 rounded-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all font-bold"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-full border-2 border-gray-200 text-gray-500 hover:border-black hover:text-black font-bold transition-colors"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4 bg-gray-50/50 border-b-2 border-gray-100">
                        <CardTitle className="text-xl font-black">Data Management</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {/* Backup */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border-2 border-black rounded-2xl hover:bg-gray-50 transition-colors group shadow-sm">
                            <div className="space-y-1">
                                <p className="font-black text-lg flex items-center gap-2"><Download className="w-5 h-5" /> Backup Data</p>
                                <p className="text-xs text-gray-500 font-bold max-w-xs">
                                    Download a JSON copy of all your financial data.
                                </p>
                            </div>
                            <Button
                                onClick={handleBackup}
                                className="h-10 px-6 rounded-full bg-white border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-all shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none"
                            >
                                Export
                            </Button>
                        </div>

                        {/* Import */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
                             <div className="space-y-1">
                                <p className="font-black text-red-700 text-lg flex items-center gap-2"><Upload className="w-5 h-5" /> Restore Data</p>
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Warning: Overwrites existing data.
                                </p>
                            </div>
                            <label htmlFor="file-upload" className="cursor-pointer shrink-0">
                                <div className="h-10 px-6 rounded-full bg-red-600 text-white border-2 border-red-800 font-bold flex items-center justify-center hover:bg-red-700 transition-all shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] hover:translate-y-[1px] hover:shadow-none">
                                    {isImportLoading ? (
                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Import File"
                                    )}
                                </div>
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
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}