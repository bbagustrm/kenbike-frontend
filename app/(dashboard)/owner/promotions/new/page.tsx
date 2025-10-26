"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromotionService } from "@/services/promotion.service";
import { handleApiError } from "@/lib/api-client";
import { CreatePromotionData } from "@/types/promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Calendar, Percent } from "lucide-react";
import { toast } from "sonner";

export default function NewPromotionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<CreatePromotionData>({
        name: "",
        discount: 0,
        startDate: "",
        endDate: "",
        isActive: true,
    });

    const handleChange = (field: keyof CreatePromotionData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            toast.error("End date must be after start date");
            return;
        }

        if (formData.discount <= 0 || formData.discount > 1) {
            toast.error("Discount must be between 0 and 1 (0% to 100%)");
            return;
        }

        setIsLoading(true);

        try {
            await PromotionService.createPromotion(formData);
            toast.success("Promotion created successfully");
            router.push("/owner/promotions");
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/owner">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/owner/promotions">Promotions</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Promotion</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create New Promotion</h1>
                    <p className="text-muted-foreground">Set up a new promotional discount campaign</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Promotion Details</CardTitle>
                        <CardDescription>Basic information about the promotion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Promotion Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Promotion Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., New Year Sale"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                                minLength={3}
                                maxLength={100}
                            />
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                            <Label htmlFor="discount">
                                Discount <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="discount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    placeholder="0.15"
                                    value={formData.discount}
                                    onChange={(e) => handleChange("discount", parseFloat(e.target.value) || 0)}
                                    required
                                    className="flex-1"
                                />
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                    {(formData.discount * 100).toFixed(0)}%
                  </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter decimal value (e.g., 0.15 for 15% discount, 0.50 for 50% discount)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Period */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Calendar className="h-5 w-5 inline mr-2" />
                            Promotion Period
                        </CardTitle>
                        <CardDescription>Set the start and end dates for this promotion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="startDate">
                                    Start Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label htmlFor="endDate">
                                    End Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => handleChange("endDate", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Additional promotion settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable or disable this promotion immediately
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleChange("isActive", checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Promotion
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}