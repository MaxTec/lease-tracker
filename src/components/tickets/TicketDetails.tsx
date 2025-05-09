"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface TicketImage {
  id: number;
  url: string;
  altText?: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  property: {
    name: string;
  };
  unit: {
    unitNumber: string;
  };
  tenant: {
    user: {
      name: string;
      email: string;
    };
  };
  comments: Comment[];
  images: TicketImage[];
}

interface Props {
  ticket: Ticket;
  userRole: "ADMIN" | "LANDLORD" | "TENANT";
}

const statusIcons: Record<string, string> = {
  OPEN: "🟦",
  IN_PROGRESS: "🟨",
  PENDING_REVIEW: "🟪",
  RESOLVED: "🟩",
  CLOSED: "⬜",
};

const priorityIcons: Record<string, string> = {
  LOW: "🟢",
  MEDIUM: "🟡",
  HIGH: "🟠",
  URGENT: "🔴",
};

const TicketDetails = ({ ticket, userRole }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [loading, setLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<TicketImage | null>(null);

  const canEdit = userRole === "ADMIN" || userRole === "LANDLORD";

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, priority }),
      });
      if (!response.ok) {
        throw new Error(t("tickets.errors.updateFailed"));
      }
      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, priority: newPriority }),
      });
      if (!response.ok) {
        throw new Error(t("tickets.errors.updateFailed"));
      }
      setPriority(newPriority);
      router.refresh();
    } catch (error) {
      console.error("Error updating ticket priority:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });
      if (!response.ok) {
        throw new Error(t("tickets.errors.commentFailed"));
      }
      setComment("");
      router.refresh();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLightbox = (image: TicketImage) => {
    setSelectedImage(image);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
  };

  const handleLightboxKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      handleCloseLightbox();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "bg-blue-100 text-blue-800 border-blue-300",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-300",
      PENDING_REVIEW: "bg-purple-100 text-purple-800 border-purple-300",
      RESOLVED: "bg-green-100 text-green-800 border-green-300",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800 border-gray-300",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
      HIGH: "bg-orange-100 text-orange-800 border-orange-300",
      URGENT: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      colors[priority as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  const statusOptions = [
    { value: "OPEN", label: t("tickets.status.open") },
    { value: "IN_PROGRESS", label: t("tickets.status.inProgress") },
    { value: "PENDING_REVIEW", label: t("tickets.status.pendingReview") },
    { value: "RESOLVED", label: t("tickets.status.resolved") },
    { value: "CLOSED", label: t("tickets.status.closed") },
  ];

  const priorityOptions = [
    { value: "LOW", label: t("tickets.priority.low") },
    { value: "MEDIUM", label: t("tickets.priority.medium") },
    { value: "HIGH", label: t("tickets.priority.high") },
    { value: "URGENT", label: t("tickets.priority.urgent") },
  ];

  return (
    <section className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50">
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold text-gray-900 break-words"
            tabIndex={0}
            aria-label={ticket.title}
          >
            {ticket.title}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          {/* Status Badge */}
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
              status
            )}`}
            tabIndex={0}
          >
            <span aria-hidden="true">{statusIcons[status]}</span>
            {canEdit ? (
              <Select
                label={t("tickets.form.status")}
                value={status}
                options={statusOptions}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-transparent border-none p-0 text-xs font-semibold focus:ring-0 focus:outline-none"
              />
            ) : (
              <span>{t(`tickets.status.${status.toLowerCase()}`)}</span>
            )}
          </span>
          {/* Priority Badge */}
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(
              priority
            )}`}
            aria-label={t("tickets.form.priority")}
            tabIndex={0}
          >
            <span aria-hidden="true">{priorityIcons[priority]}</span>
            {canEdit ? (
              <Select
                label={t("tickets.form.priority")}
                value={priority}
                options={priorityOptions}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="bg-transparent border-none p-0 text-xs font-semibold focus:ring-0 focus:outline-none"
              />
            ) : (
              <span>{t(`tickets.priority.${priority.toLowerCase()}`)}</span>
            )}
          </span>
        </div>
      </header>

      {/* Meta Info */}
      <section
        className="px-6 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            {t("tickets.form.property")}
          </span>
          <span className="font-medium text-gray-900" tabIndex={0}>
            {ticket.property.name}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            {t("tickets.form.unit")}
          </span>
          <span className="font-medium text-gray-900" tabIndex={0}>
            {ticket.unit.unitNumber}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            {t("common.dates.created")}
          </span>
          <span className="font-medium text-gray-900" tabIndex={0}>
            {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            {t("tickets.form.tenant")}
          </span>
          <span className="font-medium text-gray-900" tabIndex={0}>
            {ticket.tenant.user.name} ({ticket.tenant.user.email})
          </span>
        </div>
      </section>

      {/* Description */}
      <section
        className="px-6 py-5 border-b border-gray-100"
        aria-label={t("tickets.form.description")}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {t("tickets.form.description")}
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap" tabIndex={0}>
          {ticket.description}
        </p>
      </section>

      {/* Images Preview Section */}
      {ticket.images && ticket.images.length > 0 && (
        <section
          className="px-6 py-5 border-b border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t("tickets.images.title", { count: ticket.images.length })}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ticket.images.map((image) => (
              <button
                key={image.id}
                type="button"
                className="group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow hover:shadow-lg transition cursor-pointer"
                tabIndex={0}
                aria-label={image.altText || t("tickets.images.preview")}
                onClick={() => handleOpenLightbox(image)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleOpenLightbox(image);
                }}
              >
                <img
                  src={image.url}
                  alt={image.altText || t("tickets.images.preview")}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.altText || t("tickets.images.preview")}
          tabIndex={-1}
          onClick={handleCloseLightbox}
          onKeyDown={handleLightboxKeyDown}
        >
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.altText || t("tickets.images.preview")}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg border border-white"
            />
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCloseLightbox();
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <section className="px-6 py-5" aria-label={t("tickets.comments.title")}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t("tickets.comments.title")}
        </h2>
        <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("tickets.comments.placeholder")}
            required
            aria-label={t("tickets.comments.placeholder")}
          />
          <Button
            type="submit"
            disabled={loading}
            aria-label={t("tickets.comments.add")}
          >
            {loading ? t("common.loading") : t("tickets.comments.add")}
          </Button>
        </form>
        <div className="space-y-4">
          {ticket.comments.length === 0 && (
            <div className="text-gray-500 text-sm italic">
              {t("tickets.comments.empty")}
            </div>
          )}
          {ticket.comments.map((comment) => (
            <article
              key={comment.id}
              className="p-4 bg-gray-50 border border-gray-100 rounded-lg space-y-2"
              tabIndex={0}
              aria-label={t("tickets.comments.commentBy", {
                name: comment.user.name,
              })}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-gray-900">
                  {comment.user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default TicketDetails;
