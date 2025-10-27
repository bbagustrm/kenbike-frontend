"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromotionService } from "@/services/promotion.service";
import { handleApiError } from "@/lib/api-client";
import { CreatePromotionData } from "@/types/promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, CalendarIcon, Percent } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export default function OwnerNewPromotionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [discountPercent, setDiscountPercent] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [formData, setFormData] = useState<CreatePromotionData>({
        name: "",
        discount: 0,
        startDate: "",
        endDate: "",
        isActive: true,
    });

    const handleDiscountChange = (value: string) => {
        // Hanya izinkan angka
        if (value === "" || /^\d+$/.test(value)) {
            setDiscountPercent(value);
            const numValue = value === "" ? 0 : parseInt(value);

            if (numValue > 100) {
                toast.error("Discount cannot exceed 100%");
                return;
            }

            // Convert to decimal (20 -> 0.2)
            setFormData(prev => ({ ...prev, discount: numValue / 100 }));
        }
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);

        if (range?.from) {
            // Set to start of day and convert to ISO string
            const startDate = new Date(range.from);
            startDate.setHours(0, 0, 0, 0);
            setFormData(prev => ({
                ...prev,
                startDate: startDate.toISOString()
            }));
        }

        if (range?.to) {
            // Set to end of day and convert to ISO string
            const endDate = new Date(range.to);
            endDate.setHours(23, 59, 59, 999);
            setFormData(prev => ({
                ...prev,
                endDate: endDate.toISOString()
            }));
        }
    };

    const handleChange = (field: keyof CreatePromotionData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.startDate || !formData.endDate) {
            toast.error("Please select promotion period");
            return;
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            toast.error("End date must be after start date");
            return;
        }

        if (formData.discount <= 0 || formData.discount > 1) {
            toast.error("Discount must be between 1% and 100%");
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
        <div className="container mx-auto py-8 px-4 max-w-5xl">
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
                <Card>
                    <CardHeader>
                        <CardTitle>Promotion Details</CardTitle>
                        <CardDescription>Basic information about the promotion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="discount">
                                Discount Percentage <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="discount"
                                    type="text"
                                    placeholder="Enter discount"
                                    value={discountPercent}
                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                    required
                                    className="flex-1"
                                />
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md min-w-[80px] justify-center">
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {discountPercent || "0"}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter whole number (e.g., 20 for 20% discount, 50 for 50% discount)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            <CalendarIcon className="h-5 w-5 inline mr-2" />
                            Promotion Period
                        </CardTitle>
                        <CardDescription>Set the start and end dates for this promotion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>
                                Date Range <span className="text-destructive">*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={handleDateRangeChange}
                                        numberOfMonths={2}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">
                                Select the start and end date for the promotion period
                            </p>
                        </div>
                    </CardContent>
                </Card>

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