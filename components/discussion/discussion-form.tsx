// components/discussion/discussion-form.tsx
"use client";

import { useState } from "react";
import { DiscussionService } from "@/services/discussion.service";
import { Discussion } from "@/types/discussion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, HelpCircle, Send, LogIn } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DiscussionFormProps {
    productId: string;
    onSuccess?: (discussion: Discussion) => void;
}

export function DiscussionForm({ productId, onSuccess }: DiscussionFormProps) {
    const { locale } = useTranslation();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [question, setQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = async () => {
        if (!question.trim() || question.trim().length < 10) {
            toast.error(
                locale === "id"
                    ? "Pertanyaan minimal 10 karakter"
                    : "Question must be at least 10 characters"
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await DiscussionService.createDiscussion({
                productId,
                question: question.trim(),
            });
            setQuestion("");
            setIsFocused(false);
            toast.success(
                locale === "id"
                    ? "Pertanyaan berhasil dikirim!"
                    : "Question submitted successfully!"
            );
            onSuccess?.(response.data);
        } catch (error: unknown) {
            console.error("Failed to submit question:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to submit question";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = () => {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    };

    if (!isAuthenticated) {
        return (
            <Card className="bg-muted/50">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                            <HelpCircle className="w-10 h-10 text-muted-foreground shrink-0" />
                            <div>
                                <p className="font-medium">
                                    {locale === "id"
                                        ? "Punya pertanyaan tentang produk ini?"
                                        : "Have a question about this product?"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {locale === "id"
                                        ? "Login untuk bertanya dan mendapatkan jawaban"
                                        : "Login to ask and get answers"}
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleLogin}>
                            <LogIn className="w-4 h-4 mr-2" />
                            {locale === "id" ? "Login untuk Bertanya" : "Login to Ask"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium mb-2">
                            {locale === "id"
                                ? "Punya pertanyaan tentang produk ini?"
                                : "Have a question about this product?"}
                        </p>
                        <Textarea
                            placeholder={
                                locale === "id"
                                    ? "Tulis pertanyaan Anda di sini... (min. 10 karakter)"
                                    : "Write your question here... (min. 10 characters)"
                            }
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            rows={isFocused ? 3 : 1}
                            maxLength={1000}
                            disabled={isSubmitting}
                            className="transition-all duration-200"
                        />
                    </div>
                </div>

                {(isFocused || question.length > 0) && (
                    <div className="flex items-center justify-between pl-8">
                        <p className="text-xs text-muted-foreground">
                            {question.length}/1000
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setQuestion("");
                                    setIsFocused(false);
                                }}
                                disabled={isSubmitting}
                            >
                                {locale === "id" ? "Batal" : "Cancel"}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                size="sm"
                                disabled={isSubmitting || question.trim().length < 10}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                        {locale === "id" ? "Mengirim..." : "Sending..."}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-1" />
                                        {locale === "id" ? "Kirim Pertanyaan" : "Submit Question"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}