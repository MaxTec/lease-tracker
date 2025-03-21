"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
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
}

interface Props {
  ticket: Ticket;
}

export default function TicketDetails({ ticket }: Props) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [loading, setLoading] = useState(false);

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
        throw new Error("Failed to update ticket status");
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
        throw new Error("Failed to update ticket priority");
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
        throw new Error("Failed to add comment");
      }

      setComment("");
      router.refresh();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      PENDING_REVIEW: "bg-purple-100 text-purple-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{ticket.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Property: {ticket.property.name}</span>
          <span>Unit: {ticket.unit.unitNumber}</span>
          <span>
            Created: {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-sm text-gray-500 mr-2">Status:</span>
            <Select label="Status" value={status} options={[]}></Select>
          </div>
          <div>
            <span className="text-sm text-gray-500 mr-2">Priority:</span>
            <Select label="Priority" value={priority} options={[]}></Select>
          </div>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Adding Comment..." : "Add Comment"}
          </Button>
        </form>

        <div className="space-y-4">
          {ticket.comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{comment.user.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
