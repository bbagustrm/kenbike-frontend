"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { getImageUrl, validateImageFile, formatFileSize } from "@/lib/image-utils";

export default function ProfilePage() {
  const { user, isLoading, updateProfile, updatePassword, deleteProfileImage } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    phone_number: user?.phone_number || "",
    country: user?.country || "",
    address: user?.address || "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

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

    setError(null);

    // Validate file
    const validation = validateImageFile(file, 2);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    console.log("📷 Image selected:", {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
    });

    // Set file
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);

    // Reset file input
    const fileInput = document.getElementById("profile_image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      console.log("📤 Submitting profile update...");

      await updateProfile({
        ...profileData,
        profile_image: selectedImage || undefined,
      });

      setSuccess("Profile updated successfully!");
      setSelectedImage(null);
      setPreviewUrl(null);

      // Reset file input
      const fileInput = document.getElementById("profile_image") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await deleteProfileImage();
      setSuccess("Profile image deleted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(passwordData);
      setSuccess("Password updated successfully!");
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  // Get display image URL (preview or user's current image)
  const getDisplayImage = () => {
    if (previewUrl) return previewUrl;
    return getImageUrl(user.profile_image);
  };

  return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full md:w-fit grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and photo
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
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Show indicator if new image selected */}
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
                            {selectedImage ? "Change Photo" : "Upload Photo"}
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
                              Cancel
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
                              Remove
                            </Button>
                        )}
                      </div>

                      {selectedImage && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-sm">
                              New image selected: <strong>{selectedImage.name}</strong> ({formatFileSize(selectedImage.size)})
                              <br />
                              Click Update Profile to save changes.
                            </AlertDescription>
                          </Alert>
                      )}

                      <p className="text-xs text-muted-foreground">
                        JPG, JPEG, PNG or WEBP. Max 2MB. Recommended 400x400px
                      </p>
                    </div>
                  </div>

                  {/* Read-only fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={user.first_name} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={user.last_name} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={user.username} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user.email} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                          id="phone_number"
                          type="tel"
                          placeholder="+628123456789"
                          value={profileData.phone_number}
                          onChange={(e) =>
                              setProfileData({ ...profileData, phone_number: e.target.value })
                          }
                          disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                          id="country"
                          placeholder="Indonesia"
                          value={profileData.country}
                          onChange={(e) =>
                              setProfileData({ ...profileData, country: e.target.value })
                          }
                          disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        placeholder="Jl. Example No. 123"
                        value={profileData.address}
                        onChange={(e) =>
                            setProfileData({ ...profileData, address: e.target.value })
                        }
                        disabled={isSubmitting}
                    />
                  </div>

                  {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {success}
                        </AlertDescription>
                      </Alert>
                  )}

                  {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                    ) : (
                        "Update Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Current Password</Label>
                    <Input
                        id="old_password"
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) =>
                            setPasswordData({confirm_password: "", new_password: "", ...profileData, old_password: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                        id="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                            setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                        id="confirm_password"
                        type="password"
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
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                      <li>One special character (!@#$%^&*)</li>
                    </ul>
                  </div>

                  {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {success}
                        </AlertDescription>
                      </Alert>
                  )}

                  {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                    ) : (
                        "Update Password"
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