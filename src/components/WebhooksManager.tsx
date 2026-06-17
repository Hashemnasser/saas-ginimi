"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}

export default function WebhooksManager({
  initialSubscriptions,
}: {
  initialSubscriptions: Subscription[];
}) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "project.created",
  ]);
  const [loading, setLoading] = useState(false);

  const availableEvents = [
    "project.created",
    "project.updated",
    "project.archived",
    "project.restored",
  ];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("URL is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events: selectedEvents }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptions([data.subscription, ...subscriptions]);
        setUrl("");
        setSelectedEvents(["project.created"]);
        toast.success("Webhook subscription added");
      } else {
        toast.error(data.error || "Failed to add");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/webhooks/subscriptions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubscriptions(subscriptions.filter((s) => s.id !== id));
        toast.success("Deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-8   border border-border   p-10  rounded-2xl   shadow-zinc-500  shadow-lg">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Add New Webhook</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Enter Endpoint URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full px-4 py-2 mt-1 border rounded-lg outline-none focus:ring-2 shadow-lg focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Events : </label>
            <div className="flex justify-between w-full px-4 py-3 mt-1 border rounded-lg outline-none  shadow-lg ">
              {availableEvents.map((event) => (
                <label key={event} className="flex items-center gap-1">
                  <input
                    className=" hover:animate-pulse"
                    type="checkbox"
                    value={event}
                    checked={selectedEvents.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event]);
                      } else {
                        setSelectedEvents(
                          selectedEvents.filter((ev) => ev !== event)
                        );
                      }
                    }}
                  />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white    hover:animate-pulse px-4 py-2    shadow shadow-blue-950/55 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Adding..." : "Add Webhook"}
          </button>
        </form>
      </div>

      <div className=" justify-between w-full px-4 py-3 mt-1 border rounded-lg outline-none  shadow-lg ">
        <h2 className="text-lg font-semibold mb-4">Your Webhooks</h2>
        {subscriptions.length === 0 ? (
          <p className=" text-foreground  ">No webhooks configured.</p>
        ) : (
          <ul className="divide-y divide-background">
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="py-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-mono text-sm break-all">{sub.url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Events: {sub.events.join(", ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    Status: {sub.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div
                  onClick={() => handleDelete(sub.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-4 shadow   shadow-red-700/50   border border-red-200 p-2 rounded-xl hover:animate-pulse"
                >
                  Delete
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
