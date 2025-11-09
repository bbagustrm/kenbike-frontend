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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { getImageUrl, validateImageFile, formatFileSize } from "@/lib/image-utils";
import { getUserInitials } from "@/lib/auth-utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
    const { user, isLoading, updateProfile, updatePassword, deleteProfileImage } = useAuth();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [profileData, setProfileData] = useState({
        phone_number: user?.phone_number || "",
        country: user?.country || "",
        address: user?.address || "",
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
            await updateProfile({
                ...profileData,
                profile_image: selectedImage || undefined,
            });

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

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "OWNER":
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
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
                            <CardTitle className="flex items-center gap-2">
                                {t.profile.tabs.profile.title}
                                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                    {user.role}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {t.profile.tabs.profile.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-2 border-gray-200">
                                            <AvatarImage
                                                src={getDisplayImage()}
                                                alt={user.username}
                                            />
                                            <AvatarFallback className="text-2xl bg-secondary/50">
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
                                                <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t.profile.fields.firstName}</Label>
                                        <Input value={user.first_name} disabled className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t.profile.fields.lastName}</Label>
                                        <Input value={user.last_name} disabled className="bg-gray-50" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t.profile.fields.username}</Label>
                                        <Input value={user.username} disabled className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t.profile.fields.email}</Label>
                                        <Input value={user.email} disabled className="bg-gray-50" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="country">{t.profile.fields.country}</Label>
                                        <Input
                                            id="country"
                                            placeholder={t.profile.placeholders.country}
                                            value={profileData.country}
                                            onChange={(e) =>
                                                setProfileData({ ...profileData, country: e.target.value })
                                            }
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">{t.profile.fields.address}</Label>
                                    <Input
                                        id="address"
                                        placeholder={t.profile.placeholders.address}
                                        value={profileData.address}
                                        onChange={(e) =>
                                            setProfileData({ ...profileData, address: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="bg-blue-50 border-blue-200 p-4 rounded-md">
                                    <div className="flex">
                                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">Admin Information</h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <p>As an admin, you have access to manage users, products, categories, and tags.</p>
                                                <p className="mt-1">Your role: <span className="font-semibold">{user.role}</span></p>
                                            </div>
                                        </div>
                                    </div>
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
                                    <PasswordInput
                                        id="old_password"
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
                                    <PasswordInput
                                        id="new_password"
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
                                    <PasswordInput
                                        id="confirm_password"
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