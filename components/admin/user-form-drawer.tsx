"use client";

import React, { useState, useEffect } from "react";
import { User, UserRole, CreateUserData, UpdateUserData } from "@/types/auth";
import { UserService } from "@/services/user.service";
import { handleApiError } from "@/lib/api-client";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null; // If provided, it's edit mode
    onSuccess: () => void;
}

export function UserFormDrawer({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserFormDrawerProps) {
    const isEditMode = !!user;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        country: "",
        address: "",
        password: "",
        confirm_password: "",
        role: "USER" as UserRole,
    });

    // Reset or populate form when drawer opens
    useEffect(() => {
        if (open) {
            if (isEditMode && user) {
                // Edit mode - populate with user data
                setFormData({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    username: user.username || "",
                    email: user.email || "",
                    phone_number: user.phone_number || "",
                    country: user.country || "",
                    address: user.address || "",
                    password: "",
                    confirm_password: "",
                    role: user.role,
                });
            } else {
                // Create mode - reset form
                setFormData({
                    first_name: "",
                    last_name: "",
                    username: "",
                    email: "",
                    phone_number: "",
                    country: "",
                    address: "",
                    password: "",
                    confirm_password: "",
                    role: "USER",
                });
            }
            setFieldErrors({});
        }
    }, [open, isEditMode, user]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(password)) return "Password must contain at least one number";
        if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Validation
        if (!isEditMode) {
            // Password required for create
            if (!formData.password) {
                toast.error("Password is required");
                return;
            }

            if (formData.password !== formData.confirm_password) {
                toast.error("Passwords do not match");
                return;
            }

            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                toast.error(passwordError);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            if (isEditMode && user) {
                // Update user
                const updateData: UpdateUserData = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone_number: formData.phone_number || undefined,
                    country: formData.country || undefined,
                    address: formData.address || undefined,
                };

                await UserService.updateUser(user.id, updateData);
                toast.success(`User ${formData.username} updated successfully`);
            } else {
                // Create user
                const createData: CreateUserData = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phone_number: formData.phone_number || undefined,
                    country: formData.country || undefined,
                    address: formData.address || undefined,
                    role: formData.role,
                };

                await UserService.createUser(createData);
                toast.success(`User ${formData.username} created successfully`);
            }

            onSuccess(); // Refresh user list
            onOpenChange(false); // Close drawer
        } catch (err) {
            const errorResult = handleApiError(err);

            // Show general error message with toast
            toast.error(errorResult.message);

            // Set field-specific errors
            if (errorResult.fieldErrors) {
                setFieldErrors(errorResult.fieldErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <SheetHeader>
                        <SheetTitle>
                            {isEditMode ? "Edit User" : "Create New User"}
                        </SheetTitle>
                        <SheetDescription>
                            {isEditMode
                                ? "Update user information. Username and email cannot be changed."
                                : "Fill in the details below to create a new user account."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 p-4">
                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="first_name"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={(e) => handleChange("first_name", e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    className={fieldErrors.first_name ? "border-red-500" : ""}
                                />
                                {fieldErrors.first_name && (
                                    <p className="text-xs text-red-500">{fieldErrors.first_name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="last_name"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={(e) => handleChange("last_name", e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    className={fieldErrors.last_name ? "border-red-500" : ""}
                                />
                                {fieldErrors.last_name && (
                                    <p className="text-xs text-red-500">{fieldErrors.last_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Username (only for create) */}
                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Username <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => handleChange("username", e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    pattern="[a-zA-Z0-9_]+"
                                    title="Username can only contain letters, numbers, and underscores"
                                    className={fieldErrors.username ? "border-red-500" : ""}
                                />
                                {fieldErrors.username && (
                                    <p className="text-xs text-red-500">{fieldErrors.username}</p>
                                )}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                disabled={isSubmitting || isEditMode}
                                required
                                className={fieldErrors.email ? "border-red-500" : ""}
                            />
                            {fieldErrors.email && (
                                <p className="text-xs text-red-500">{fieldErrors.email}</p>
                            )}
                            {isEditMode && (
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            )}
                        </div>

                        {/* Phone & Country */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="+628123456789"
                                    value={formData.phone_number}
                                    onChange={(e) => handleChange("phone_number", e.target.value)}
                                    disabled={isSubmitting}
                                    className={fieldErrors.phone_number ? "border-red-500" : ""}
                                />
                                {fieldErrors.phone_number && (
                                    <p className="text-xs text-red-500">{fieldErrors.phone_number}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    placeholder="Indonesia"
                                    value={formData.country}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                    disabled={isSubmitting}
                                    maxLength={50}
                                    className={fieldErrors.country ? "border-red-500" : ""}
                                />
                                {fieldErrors.country && (
                                    <p className="text-xs text-red-500">{fieldErrors.country}</p>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="Jl. Example No. 123"
                                value={formData.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                disabled={isSubmitting}
                                maxLength={255}
                                className={fieldErrors.address ? "border-red-500" : ""}
                            />
                            {fieldErrors.address && (
                                <p className="text-xs text-red-500">{fieldErrors.address}</p>
                            )}
                        </div>

                        {/* Role (only for create) */}
                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => handleChange("role", value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className={fieldErrors.role ? "border-red-500" : ""}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="OWNER">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.role && (
                                    <p className="text-xs text-red-500">{fieldErrors.role}</p>
                                )}
                            </div>
                        )}

                        {/* Password (only for create) */}
                        {!isEditMode && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            disabled={isSubmitting}
                                            required
                                            className={fieldErrors.password ? "border-red-500" : ""}
                                        />
                                        {fieldErrors.password && (
                                            <p className="text-xs text-red-500">{fieldErrors.password}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="confirm_password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirm_password}
                                            onChange={(e) => handleChange("confirm_password", e.target.value)}
                                            disabled={isSubmitting}
                                            required
                                            className={fieldErrors.confirm_password ? "border-red-500" : ""}
                                        />
                                        {fieldErrors.confirm_password && (
                                            <p className="text-xs text-red-500">{fieldErrors.confirm_password}</p>
                                        )}
                                    </div>
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
                            </>
                        )}
                    </div>

                    <SheetFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>{isEditMode ? "Update User" : "Create User"}</>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}