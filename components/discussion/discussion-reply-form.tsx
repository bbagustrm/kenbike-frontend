// components/discussion/discussion-reply-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface DiscussionReplyFormProps {
    onSubmit: (content: string) => Promise<void>;
    onCancel?: () => void;
    placeholder?: string;
    submitLabel?: string;
    initialValue?: string;
    isEdit?: boolean;
}

export function DiscussionReplyForm({
                                        onSubmit,
                                        onCancel,
                                        placeholder,
                                        submitLabel,
                                        initialValue = "",
                                        isEdit = false,
                                    }: DiscussionReplyFormProps) {
    const { locale } = useTranslation();
    const [content, setContent] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultPlaceholder = locale === "id"
        ? "Tulis jawaban Anda..."
        : "Write your answer...";

    const defaultSubmitLabel = isEdit
        ? (locale === "id" ? "Simpan" : "Save")
        : (locale === "id" ? "Kirim" : "Send");

    const handleSubmit = async () => {
        if (!content.trim() || content.trim().length < 5) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content.trim());
            if (!isEdit) {
                setContent("");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <div className="space-y-3">
            <Textarea
                placeholder={placeholder || defaultPlaceholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                maxLength={1000}
                disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    {content.length}/1000
                    {" · "}
                    {locale === "id" ? "Ctrl+Enter untuk kirim" : "Ctrl+Enter to send"}
                </p>
                <div className="flex gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4 mr-1" />
                            {locale === "id" ? "Batal" : "Cancel"}
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        size="sm"
                        disabled={isSubmitting || content.trim().length < 5}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-1" />
                        )}
                        {submitLabel || defaultSubmitLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}