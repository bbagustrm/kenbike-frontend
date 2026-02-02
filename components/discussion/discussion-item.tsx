// components/discussion/discussion-item.tsx
"use client";

import { useState } from "react";
import { Discussion, DiscussionReply } from "@/types/discussion";
import { DiscussionService } from "@/services/discussion.service";
import { DiscussionReplyForm } from "./discussion-reply-form";
import { LikeButton } from "./like-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, MessageCircle, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface DiscussionItemProps {
    discussion: Discussion;
    onUpdate?: () => void;
}

export function DiscussionItem({ discussion, onUpdate }: DiscussionItemProps) {
    const { locale } = useTranslation();
    const { user, isAuthenticated } = useAuth();

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(discussion.replies.length <= 3);
    const [replies, setReplies] = useState<DiscussionReply[]>(discussion.replies);
    const [likesCount, setLikesCount] = useState(discussion.likesCount);
    const [isLiked, setIsLiked] = useState(discussion.isLiked);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [replyToDelete, setReplyToDelete] = useState<string | null>(null);

    const isOwner = user?.id === discussion.user.id;
    const isAdmin = user?.role === "ADMIN" || user?.role === "OWNER";
    const canDelete = isOwner || isAdmin;

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            locale === "id" ? "id-ID" : "en-US",
            { day: "numeric", month: "short", year: "numeric" }
        );
    };

    const handleToggleLike = async () => {
        if (!isAuthenticated) {
            toast.error(locale === "id" ? "Silakan login terlebih dahulu" : "Please login first");
            return;
        }

        try {
            const response = await DiscussionService.toggleDiscussionLike(discussion.id);
            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likesCount);
        } catch (error) {
            console.error("Failed to toggle like:", error);
            throw error;
        }
    };

    const handleReplyToggleLike = async (replyId: string) => {
        if (!isAuthenticated) {
            toast.error(locale === "id" ? "Silakan login terlebih dahulu" : "Please login first");
            return;
        }

        try {
            const response = await DiscussionService.toggleReplyLike(replyId);
            setReplies((prev) =>
                prev.map((r) =>
                    r.id === replyId
                        ? { ...r, isLiked: response.data.isLiked, likesCount: response.data.likesCount }
                        : r
                )
            );
        } catch (error) {
            console.error("Failed to toggle reply like:", error);
            throw error;
        }
    };

    const handleSubmitReply = async (content: string) => {
        try {
            const response = await DiscussionService.createReply(discussion.id, { content });
            setReplies((prev) => [...prev, response.data]);
            setShowReplyForm(false);
            setShowReplies(true);
            toast.success(locale === "id" ? "Jawaban berhasil dikirim" : "Reply sent successfully");
        } catch (error) {
            console.error("Failed to submit reply:", error);
            toast.error(locale === "id" ? "Gagal mengirim jawaban" : "Failed to send reply");
        }
    };

    const handleDeleteDiscussion = async () => {
        try {
            await DiscussionService.deleteDiscussion(discussion.id);
            toast.success(locale === "id" ? "Pertanyaan berhasil dihapus" : "Question deleted successfully");
            onUpdate?.();
        } catch (error) {
            console.error("Failed to delete discussion:", error);
            toast.error(locale === "id" ? "Gagal menghapus pertanyaan" : "Failed to delete question");
        }
        setDeleteDialogOpen(false);
    };

    const handleDeleteReply = async () => {
        if (!replyToDelete) return;

        try {
            await DiscussionService.deleteReply(replyToDelete);
            setReplies((prev) => prev.filter((r) => r.id !== replyToDelete));
            toast.success(locale === "id" ? "Jawaban berhasil dihapus" : "Reply deleted successfully");
        } catch (error) {
            console.error("Failed to delete reply:", error);
            toast.error(locale === "id" ? "Gagal menghapus jawaban" : "Failed to delete reply");
        }
        setReplyToDelete(null);
    };

    return (
        <div className="border border-border rounded-lg p-4">
            {/* Question Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={discussion.user.profileImage || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(discussion.user.name || discussion.user.username)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">
                                {discussion.user.name || discussion.user.username}
                            </span>
                            {discussion.user.isAdmin && (
                                <Badge variant="adminRole" className="gap-1 text-xs bg-blue-400">
                                    <ShieldCheck className="w-3 h-3" />
                                    {discussion.user.role === "OWNER" ? "Owner" : "Admin"}
                                </Badge>
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {formatDate(discussion.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Actions Menu */}
                {canDelete && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {locale === "id" ? "Hapus" : "Delete"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Question Content */}
            <p className="text-foreground mb-4 pl-13">{discussion.question}</p>

            {/* Question Actions */}
            <div className="flex items-center gap-2 pl-13 mb-4">
                <LikeButton
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onToggle={handleToggleLike}
                    disabled={!isAuthenticated}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    disabled={!isAuthenticated}
                >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {locale === "id" ? "Jawab" : "Reply"}
                </Button>
                {replies.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? (
                            <ChevronUp className="w-4 h-4 mr-1" />
                        ) : (
                            <ChevronDown className="w-4 h-4 mr-1" />
                        )}
                        {replies.length} {locale === "id" ? "jawaban" : "replies"}
                    </Button>
                )}
            </div>

            {/* Reply Form */}
            <AnimatePresence>
                {showReplyForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-13 mb-4"
                    >
                        <DiscussionReplyForm
                            onSubmit={handleSubmitReply}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Replies */}
            <AnimatePresence>
                {showReplies && replies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pl-13 space-y-3 border-l-2 border-muted ml-5"
                    >
                        {replies.map((reply) => {
                            const replyIsOwner = user?.id === reply.user.id;
                            const replyCanDelete = replyIsOwner || isAdmin;

                            return (
                                <div key={reply.id} className="pl-4 py-2">
                                    {/* Reply Header */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={reply.user.profileImage || undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {getInitials(reply.user.name || reply.user.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">
                                                {reply.user.name || reply.user.username}
                                            </span>
                                            {reply.user.isAdmin && (
                                                <Badge variant="default" className="gap-0.5 text-xs py-0 px-1.5">
                                                    <ShieldCheck className="w-2.5 h-2.5" />
                                                    {reply.user.role === "OWNER" ? "Owner" : "Admin"}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(reply.createdAt)}
                                            </span>
                                        </div>

                                        {replyCanDelete && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <MoreVertical className="w-3 h-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setReplyToDelete(reply.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {locale === "id" ? "Hapus" : "Delete"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    {/* Reply Content */}
                                    <p className="text-sm text-foreground mb-2 pl-8">
                                        {reply.content}
                                    </p>

                                    {/* Reply Actions */}
                                    <div className="pl-8">
                                        <LikeButton
                                            isLiked={reply.isLiked}
                                            likesCount={reply.likesCount}
                                            onToggle={() => handleReplyToggleLike(reply.id)}
                                            disabled={!isAuthenticated}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Discussion Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {locale === "id" ? "Hapus Pertanyaan" : "Delete Question"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {locale === "id"
                                ? "Apakah Anda yakin ingin menghapus pertanyaan ini? Semua jawaban juga akan dihapus."
                                : "Are you sure you want to delete this question? All replies will also be deleted."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {locale === "id" ? "Batal" : "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDiscussion}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {locale === "id" ? "Hapus" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Reply Dialog */}
            <AlertDialog open={!!replyToDelete} onOpenChange={() => setReplyToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {locale === "id" ? "Hapus Jawaban" : "Delete Reply"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {locale === "id"
                                ? "Apakah Anda yakin ingin menghapus jawaban ini?"
                                : "Are you sure you want to delete this reply?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {locale === "id" ? "Batal" : "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteReply}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {locale === "id" ? "Hapus" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}