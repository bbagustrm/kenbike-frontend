// (dashboard)/user/profile/page.tsx
"use client";

import { useState, useEffect } from "react";  // ✅ Add useEffect
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { getImageUrl, validateImageFile, formatFileSize } from "@/lib/image-utils";
import { getUserInitials } from "@/lib/auth-utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { LocationForm, LocationData } from "@/components/forms/location-form";
import { UpdateProfilePayload } from "@/types/auth";

export default function ProfilePage() {
  const { user, isLoading, updateProfile, updatePassword, deleteProfileImage } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileData, setProfileData] = useState({
    phone_number: user?.phone_number || "",
  });

  const [locationData, setLocationData] = useState<LocationData>(() => {
    if (!user) return { country: "Indonesia" };

    const isIndonesia = user.country === "Indonesia" || !!user.province;
    return {
      country: isIndonesia ? "Indonesia" : "Global",
      province: user.province || undefined,
      city: user.city || undefined,
      district: user.district || undefined,
      postal_code: user.postal_code || undefined,
      country_name: !isIndonesia ? user.country : undefined,
      address: user.address || undefined,
    };
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ✅ ADD THIS: Sync user data to state when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        phone_number: user.phone_number || "",
      });

      const isIndonesia = user.country === "Indonesia" || !!user.province;
      setLocationData({
        province: user.province || undefined,
        city: user.city || undefined,
        district: user.district || undefined,
        postal_code: user.postal_code || undefined,
        country: !isIndonesia ? user.country : undefined,
        address: user.address || undefined,
      });
    }
  }, [user]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 2);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById("profile_image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData: UpdateProfilePayload = {
        phone_number: profileData.phone_number || undefined,
        address: locationData.address,
      };

      // ✅ FIXED: Add location data including district
      if (locationData.country === "Indonesia") {
        updateData.country = "Indonesia";
        updateData.province = locationData.province;
        updateData.city = locationData.city;
        updateData.district = locationData.district;  // ✅ ADD THIS
        updateData.postal_code = locationData.postal_code;
      } else {
        updateData.country = locationData.country;
        updateData.province = locationData.province;
        updateData.city = locationData.city;
        updateData.district = locationData.district;  // ✅ ADD THIS
        updateData.postal_code = locationData.postal_code;
      }

      if (selectedImage) {
        updateData.profile_image = selectedImage;
      }

      await updateProfile(updateData);

      toast.success(t.profile.messages.updateSuccess);
      setSelectedImage(null);
      setPreviewUrl(null);

      const fileInput = document.getElementById("profile_image") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      toast.error(err instanceof Error ? err.message : t.profile.messages.updateError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm(t.profile.messages.confirmDeleteImage)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteProfileImage();
      toast.success(t.profile.messages.deleteImageSuccess);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.profile.messages.deleteImageError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error(t.profile.messages.passwordsDoNotMatch);
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(passwordData);
      toast.success(t.profile.messages.updatePasswordSuccess);
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.profile.messages.updatePasswordError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayImage = () => {
    if (previewUrl) return previewUrl;
    return getImageUrl(user.profile_image);
  };

  return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t.profile.title}</h1>
          <p className="text-muted-foreground">
            {t.profile.description}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full md:w-fit grid-cols-2">
            <TabsTrigger value="profile">{t.profile.tabs.profile.title}</TabsTrigger>
            <TabsTrigger value="password">{t.profile.tabs.password.title}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t.profile.tabs.profile.title}</CardTitle>
                <CardDescription>
                  {t.profile.tabs.profile.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-gray-200">
                        <AvatarImage
                            src={getDisplayImage()}
                            alt={user.username}
                        />
                        <AvatarFallback className="text-2xl">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedImage && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Label htmlFor="profile_image" className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                            <Upload className="h-4 w-4" />
                            {selectedImage ? t.profile.buttons.changePhoto : t.profile.buttons.uploadPhoto}
                          </div>
                        </Label>
                        <Input
                            id="profile_image"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isSubmitting}
                        />

                        {selectedImage && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelImage}
                                disabled={isSubmitting}
                            >
                              <X className="h-4 w-4 mr-2" />
                              {t.profile.buttons.cancel}
                            </Button>
                        )}

                        {user.profile_image && !selectedImage && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteImage}
                                disabled={isSubmitting}
                            >
                              <X className="h-4 w-4 mr-2" />
                              {t.profile.buttons.remove}
                            </Button>
                        )}
                      </div>

                      {selectedImage && (
                          <div className="bg-blue-50 border-blue-200 p-3 rounded-md">
                            <div className="flex">
                              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                              <p className="text-blue-800 text-sm ml-2">
                                {t.profile.messages.imageSelected} <strong>{selectedImage.name}</strong> ({formatFileSize(selectedImage.size)})
                                <br />
                                {t.profile.messages.clickToSave}
                              </p>
                            </div>
                          </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {t.profile.imageInfo}
                      </p>
                    </div>
                  </div>

                  {/* Personal Information (Read-only) */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.profile.fields.firstName}</Label>
                        <Input value={user.first_name} disabled className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.profile.fields.lastName}</Label>
                        <Input value={user.last_name} disabled className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.profile.fields.username}</Label>
                        <Input value={user.username} disabled className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.profile.fields.email}</Label>
                        <Input value={user.email} disabled className="bg-gray-50" />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">{t.profile.fields.phone}</Label>
                      <Input
                          id="phone_number"
                          type="tel"
                          placeholder={t.profile.placeholders.phone}
                          value={profileData.phone_number}
                          onChange={(e) =>
                              setProfileData({ ...profileData, phone_number: e.target.value })
                          }
                          disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Location Information</h3>
                    <LocationForm
                        value={locationData}
                        onChange={setLocationData}
                        disabled={isSubmitting}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.profile.buttons.updating}
                        </>
                    ) : (
                        t.profile.buttons.updateProfile
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>{t.profile.tabs.password.title}</CardTitle>
                <CardDescription>
                  {t.profile.tabs.password.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">{t.profile.fields.currentPassword}</Label>
                    <Input
                        id="old_password"
                        type="password"
                        placeholder={t.profile.placeholders.currentPassword}
                        value={passwordData.old_password}
                        onChange={(e) =>
                            setPasswordData({ ...passwordData, old_password: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">{t.profile.fields.newPassword}</Label>
                    <Input
                        id="new_password"
                        type="password"
                        placeholder={t.profile.placeholders.newPassword}
                        value={passwordData.new_password}
                        onChange={(e) =>
                            setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">{t.profile.fields.confirmNewPassword}</Label>
                    <Input
                        id="confirm_password"
                        type="password"
                        placeholder={t.profile.placeholders.confirmNewPassword}
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirm_password: e.target.value,
                            })
                        }
                        disabled={isSubmitting}
                        required
                    />
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{t.profile.passwordRequirements.title}</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>{t.profile.passwordRequirements.length}</li>
                      <li>{t.profile.passwordRequirements.uppercase}</li>
                      <li>{t.profile.passwordRequirements.lowercase}</li>
                      <li>{t.profile.passwordRequirements.number}</li>
                      <li>{t.profile.passwordRequirements.special}</li>
                    </ul>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.profile.buttons.updating}
                        </>
                    ) : (
                        t.profile.buttons.updatePassword
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}