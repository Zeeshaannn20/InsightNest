"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string | null;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    // RLS restricts this to the caller's own rows, so no user filter is needed.
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, type, link, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    setItems((data ?? []) as Notification[]);
  }, [supabase]);

  useEffect(() => {
    load();

    // Supabase pushes new rows over a realtime channel, so an announcement
    // appears without the student reloading. Polling is the fallback if the
    // socket cannot connect.
    const channel = supabase
      .channel("notifications-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, load)
      .subscribe();

    const poll = setInterval(load, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [load, supabase]);

  // Close when clicking outside the panel.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = items.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    if (ids.length === 0) return;

    setItems((xs) => xs.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
  };

  const markOneRead = async (n: Notification) => {
    if (n.is_read) return;
    setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        className="relative w-11 h-11 rounded-full bg-surface-container-low border border-outline-variant/40 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-error text-white text-[11px] font-bold flex items-center justify-center border-2 border-surface">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-card overflow-hidden z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
            <p className="font-bold text-primary-container text-sm">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-3xl text-outline mb-2 block">
                notifications_off
              </span>
              <p className="text-sm text-on-surface-variant">Nothing yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/20 max-h-96 overflow-y-auto">
              {items.map((n) => {
                const body = (
                  <>
                    <div className="flex items-start gap-2.5">
                      {!n.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-secondary shrink-0" />
                      )}
                      <div className={`min-w-0 ${n.is_read ? "pl-[18px]" : ""}`}>
                        <p
                          className={`text-sm leading-snug ${
                            n.is_read
                              ? "text-on-surface-variant"
                              : "font-semibold text-primary-container"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] text-outline">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </>
                );

                return (
                  <li key={n.id} className="hover:bg-surface-container-low/50 transition-colors">
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          markOneRead(n);
                          setOpen(false);
                        }}
                        className="block px-4 py-3"
                      >
                        {body}
                      </Link>
                    ) : (
                      <button onClick={() => markOneRead(n)} className="w-full text-left px-4 py-3">
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/dashboard/announcements"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-xs font-semibold text-secondary border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors"
          >
            View all announcements
          </Link>
        </div>
      )}
    </div>
  );
}
