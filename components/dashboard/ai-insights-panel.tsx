// components/dashboard/ai-insights-panel.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sparkles,
    Send,
    RefreshCw,
    TrendingUp,
    Package,
    Target,
    Lightbulb,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiInsight, AiSummary } from "@/types/analytics";

interface AiInsightsPanelProps {
    summary?: AiSummary | null;
    summaryLoading?: boolean;
    onRefreshSummary?: () => void;
    onAskAi?: (query: string) => Promise<AiInsight>;
    className?: string;
}

const quickQuestions = [
    {
        icon: TrendingUp,
        label: "Analisa Penjualan",
        query: "Analisa trend penjualan minggu ini dan berikan rekomendasi untuk meningkatkan revenue",
    },
    {
        icon: Package,
        label: "Prediksi Stok",
        query: "Produk mana yang perlu di-restock dalam waktu dekat berdasarkan trend penjualan?",
    },
    {
        icon: Target,
        label: "Promo Optimal",
        query: "Produk mana yang cocok untuk promosi dan strategi diskon yang optimal?",
    },
    {
        icon: Lightbulb,
        label: "Peluang Bisnis",
        query: "Identifikasi peluang bisnis dan produk potensial berdasarkan data saat ini",
    },
];

export function AiInsightsPanel({
                                    summary,
                                    summaryLoading,
                                    onRefreshSummary,
                                    onAskAi,
                                    className,
                                }: AiInsightsPanelProps) {
    const [customQuery, setCustomQuery] = useState("");
    const [aiResponse, setAiResponse] = useState<AiInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAskAi = async (query: string) => {
        if (!onAskAi || !query.trim()) return;

        setIsLoading(true);
        setAiResponse(null);
        setIsExpanded(true);

        try {
            const response = await onAskAi(query);
            setAiResponse(response);
        } catch (error) {
            setAiResponse({
                insight: "Maaf, terjadi kesalahan saat menganalisa. Silakan coba lagi.",
                error: "API Error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (query: string) => {
        setCustomQuery(query);
        handleAskAi(query);
    };

    const handleSubmit = () => {
        if (customQuery.trim()) {
            handleAskAi(customQuery);
        }
    };

    return (
        <Card className={cn("bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-500" />
                        AI Business Insights
                        <Badge variant="secondary" className="ml-2 bg-violet-100 text-violet-700">
                            Gemini
                        </Badge>
                    </CardTitle>
                    {onRefreshSummary && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefreshSummary}
                            disabled={summaryLoading}
                        >
                            <RefreshCw className={cn("h-4 w-4", summaryLoading && "animate-spin")} />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* AI Summary */}
                <div className="bg-white/80 rounded-lg p-4 border border-violet-100">
                    <h4 className="text-sm font-medium text-violet-700 mb-2">
                        📊 Ringkasan AI
                    </h4>
                    {summaryLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : summary?.summary ? (
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {summary.summary}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            AI Summary tidak tersedia. Pastikan GEMINI_API_KEY sudah dikonfigurasi.
                        </p>
                    )}
                </div>

                {/* Quick Questions */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        🚀 Analisa Cepat
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {quickQuestions.map((q, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickQuestion(q.query)}
                                disabled={isLoading}
                                className="justify-start h-auto py-2 px-3 bg-white hover:bg-violet-50 border-violet-200"
                            >
                                <q.icon className="h-4 w-4 mr-2 text-violet-500" />
                                <span className="text-xs">{q.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Custom Query */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        💬 Tanya AI
                    </h4>
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Contoh: Analisa performa kategori spare part bulan ini..."
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            className="min-h-[60px] bg-white resize-none text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !customQuery.trim()}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* AI Response */}
                {(aiResponse || isLoading) && (
                    <div className="bg-white rounded-lg border border-violet-200 overflow-hidden">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                            <span className="text-sm font-medium text-violet-700">
                                🤖 Hasil Analisa AI
                            </span>
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                        {isExpanded && (
                            <div className="p-4 pt-0 border-t">
                                {isLoading ? (
                                    <div className="space-y-2 py-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                ) : aiResponse ? (
                                    <div className="prose prose-sm max-w-none py-2">
                                        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                            {aiResponse.insight}
                                        </div>
                                        {aiResponse.generated_at && (
                                            <p className="text-xs text-muted-foreground mt-3">
                                                Generated: {new Date(aiResponse.generated_at).toLocaleString('id-ID')}
                                            </p>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}