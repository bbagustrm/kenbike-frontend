// components/dashboard/ai-insights-panel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sparkles, Send, RefreshCw, TrendingUp,
    Package, Target, Lightbulb, ChevronDown, ChevronUp, Clock,
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
    { icon: TrendingUp, label: "Analisa Penjualan", query: "Analisa trend penjualan minggu ini dan berikan rekomendasi untuk meningkatkan revenue" },
    { icon: Package,    label: "Prediksi Stok",     query: "Produk mana yang perlu di-restock dalam waktu dekat berdasarkan trend penjualan?" },
    { icon: Target,     label: "Promo Optimal",     query: "Produk mana yang cocok untuk promosi dan strategi diskon yang optimal?" },
    { icon: Lightbulb,  label: "Peluang Bisnis",    query: "Identifikasi peluang bisnis dan produk potensial berdasarkan data saat ini" },
];

export function AiInsightsPanel({
                                    summary,
                                    summaryLoading,
                                    onRefreshSummary,
                                    onAskAi,
                                    className,
                                }: AiInsightsPanelProps) {
    const [customQuery, setCustomQuery] = useState("");
    const [pendingQuery, setPendingQuery] = useState("");
    const [aiResponse, setAiResponse] = useState<AiInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Rate limit countdown
    const [countdown, setCountdown] = useState(0);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimers = () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };

    useEffect(() => () => clearTimers(), []);

    const startCountdown = (seconds: number, retryFn: () => void) => {
        setCountdown(seconds);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        retryTimeoutRef.current = setTimeout(retryFn, seconds * 1000);
    };

    const handleAskAi = async (query: string) => {
        if (!onAskAi || !query.trim()) return;

        clearTimers();
        setCountdown(0);
        setIsLoading(true);
        setAiResponse(null);
        setIsExpanded(true);
        setPendingQuery(query);

        try {
            const response = await onAskAi(query);

            if (response.error === "RATE_LIMITED" && response.retry_after) {
                // Show rate-limit state and auto-retry
                setAiResponse(response);
                setIsLoading(false);
                startCountdown(response.retry_after, () => handleAskAi(query));
            } else {
                setAiResponse(response);
                setIsLoading(false);
            }
        } catch {
            setAiResponse({ insight: "Maaf, terjadi kesalahan saat menganalisa. Silakan coba lagi." });
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (query: string) => {
        setCustomQuery(query);
        handleAskAi(query);
    };

    const isRateLimited = aiResponse?.error === "RATE_LIMITED" && countdown > 0;

    return (
        <Card className={cn("bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-500" />
                        AI Business Insights
                        <Badge variant="secondary" className="ml-2 bg-violet-100 text-violet-700">Gemini</Badge>
                    </CardTitle>
                    {onRefreshSummary && (
                        <Button variant="ghost" size="sm" onClick={onRefreshSummary} disabled={summaryLoading}>
                            <RefreshCw className={cn("h-4 w-4", summaryLoading && "animate-spin")} />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="bg-white/80 rounded-lg p-4 border border-violet-100">
                    <h4 className="text-sm font-medium text-violet-700 mb-2">📊 Ringkasan AI</h4>
                    {summaryLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : summary?.summary ? (
                        <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
                    ) : (
                        <p className="text-sm text-gray-400 italic">
                            AI Summary tidak tersedia. Pastikan GEMINI_API_KEY sudah dikonfigurasi.
                        </p>
                    )}
                </div>

                {/* Quick Questions */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">🚀 Analisa Cepat</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {quickQuestions.map((q, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickQuestion(q.query)}
                                disabled={isLoading || isRateLimited}
                                className="justify-start h-auto py-2 px-3 bg-white hover:bg-violet-50 border-violet-200"
                            >
                                <q.icon className="h-4 w-4 mr-2 text-violet-500 shrink-0" />
                                <span className="text-xs">{q.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Custom Query */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">💬 Tanya AI</h4>
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Contoh: Analisa performa kategori spare part bulan ini..."
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            className="min-h-[60px] bg-white resize-none text-sm"
                            disabled={isRateLimited}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (customQuery.trim()) handleAskAi(customQuery);
                                }
                            }}
                        />
                        <Button
                            onClick={() => { if (customQuery.trim()) handleAskAi(customQuery); }}
                            disabled={isLoading || !customQuery.trim() || isRateLimited}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {isLoading
                                ? <RefreshCw className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />
                            }
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
                            <span className="text-sm font-medium text-violet-700">🤖 Hasil Analisa AI</span>
                            {isExpanded
                                ? <ChevronUp className="h-4 w-4 text-gray-500" />
                                : <ChevronDown className="h-4 w-4 text-gray-500" />
                            }
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
                                ) : isRateLimited ? (
                                    // ── Rate Limited State ──
                                    <div className="py-4 flex flex-col items-center gap-3 text-center">
                                        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">API sedang sibuk</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Otomatis mencoba ulang dalam{" "}
                                                <span className="font-semibold text-amber-600 tabular-nums">
                                                    {countdown}s
                                                </span>
                                            </p>
                                        </div>
                                        {/* Countdown progress bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${(countdown / (aiResponse?.retry_after || countdown)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                clearTimers();
                                                setCountdown(0);
                                                handleAskAi(pendingQuery);
                                            }}
                                        >
                                            Coba Sekarang
                                        </Button>
                                    </div>
                                ) : aiResponse ? (
                                    <div className="py-2">
                                        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                            {aiResponse.insight}
                                        </div>
                                        {aiResponse.generated_at && (
                                            <p className="text-xs text-gray-400 mt-3">
                                                Generated: {new Date(aiResponse.generated_at).toLocaleString("id-ID")}
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