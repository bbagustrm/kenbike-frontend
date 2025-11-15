"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserService } from "@/services/user.service";
import { handleApiError } from "@/lib/api-client";
import { User, UserRole, CreateUserData, UpdateUserData } from "@/types/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { LocationForm, LocationData } from "@/components/forms/location-form";

interface UserFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSuccess: () => void;
}

export function UserFormDrawer({ open, onOpenChange, user, onSuccess }: UserFormDrawerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        role: "USER" as UserRole,
        password: "",
        confirm_password: "",
    });

    const [locationData, setLocationData] = useState<LocationData>({
        country: "Indonesia",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number || "",
                role: user.role,
                password: "",
                confirm_password: "",
            });

            const isIndonesia = user.country === "Indonesia" || user.province;
            setLocationData({
                country: isIndonesia ? "Indonesia" : "Global",
                province_name: user.province || undefined,
                city_name: user.city || undefined,
                postal_code: user.postal_code || undefined,
                country_name: !isIndonesia ? user.country : undefined,
                province: !isIndonesia ? user.province : undefined,
                city: !isIndonesia ? user.city : undefined,
                address: user.address || undefined,
            });
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                username: "",
                email: "",
                phone_number: "",
                role: "USER",
                password: "",
                confirm_password: "",
            });
            setLocationData({
                country: "Indonesia",
            });
        }
    }, [user, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password for new users
        if (!user) {
            if (!formData.password) {
                toast.error("Password is required");
                return;
            }
            if (formData.password !== formData.confirm_password) {
                toast.error("Passwords do not match");
                return;
            }
            if (formData.password.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const locationPayload = {
                address: locationData.address,
                ...(locationData.country === "Indonesia"
                        ? {
                            country: "Indonesia",
                            province: locationData.province_name,
                            city: locationData.city_name,
                            postal_code: locationData.postal_code,
                        }
                        : {
                            country: locationData.country_name,
                            province: locationData.province,
                            city: locationData.city,
                            postal_code: locationData.postal_code,
                        }
                ),
            };

            if (user) {
                // Update existing user
                // Gunakan tipe UpdateUserData
                const updateData: UpdateUserData = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone_number: formData.phone_number,
                    ...locationPayload,
                };

                await UserService.updateUser(user.id, updateData);
                toast.success("User updated successfully");
            } else {
                // Create new user
                // Gunakan tipe CreateUserData
                const createData: CreateUserData = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    email: formData.email,
                    phone_number: formData.phone_number,
                    password: formData.password,
                    role: formData.role,
                    ...locationPayload,
                };

                await UserService.createUser(createData);
                toast.success("User created successfully");
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{user ? "Edit User" : "Create New User"}</SheetTitle>
                    <SheetDescription>
                        {user
                            ? "Update user information. Click save when you're done."
                            : "Fill in the information to create a new user account."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    minLength={2}
                                    maxLength={50}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    minLength={2}
                                    maxLength={50}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Account Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required={!user}
                                disabled={!!user}
                                minLength={3}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_]+"
                            />
                            {user && (
                                <p className="text-xs text-muted-foreground">
                                    Username cannot be changed
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                maxLength={255}
                            />
                        </div>

                        {!user && (
                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, role: value as UserRole })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="OWNER">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Password (only for new users) */}
                    {!user && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Password</h3>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">
                                    Confirm Password <span className="text-red-500">*</span>
                                </Label>
                                <PasswordInput
                                    id="confirm_password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Contact Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="+62 812 3456 7890"
                            />
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Location Information</h3>
                        <LocationForm
                            value={locationData}
                            onChange={setLocationData}
                            disabled={isSubmitting}
                        />
                    </div>

                    <SheetFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {user ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>{user ? "Update User" : "Create User"}</>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}