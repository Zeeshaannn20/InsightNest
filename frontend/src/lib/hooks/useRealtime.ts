"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeChatOptions {
  courseId: string;
  enabled?: boolean;
}

export function useRealtimeChat({ courseId, enabled = true }: UseRealtimeChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(id, full_name, role, avatar_url)
      `)
      .eq("course_id", courseId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (!error && data) {
      setMessages(data as unknown as ChatMessage[]);
    }
    setLoading(false);
  }, [supabase, courseId]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!enabled || !courseId) return;

    fetchMessages();

    let channel: RealtimeChannel;

    const setupSubscription = () => {
      channel = supabase
        .channel(`chat:${courseId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `course_id=eq.${courseId}`,
          },
          async (payload) => {
            // Fetch the full message with sender profile
            const { data } = await supabase
              .from("chat_messages")
              .select(`
                *,
                sender:profiles!chat_messages_sender_id_fkey(id, full_name, role, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single();

            if (data) {
              setMessages((prev) => [...prev, data as unknown as ChatMessage]);
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, courseId, enabled, fetchMessages]);

  // Send a message
  const sendMessage = useCallback(
    async (message: string, senderId: string) => {
      const { error } = await supabase.from("chat_messages").insert({
        course_id: courseId,
        sender_id: senderId,
        message,
      });
      return { error };
    },
    [supabase, courseId]
  );

  // Reply to a message
  const replyToMessage = useCallback(
    async (message: string, senderId: string, replyToId: string) => {
      const { error } = await supabase.from("chat_messages").insert({
        course_id: courseId,
        sender_id: senderId,
        message,
        reply_to: replyToId,
      });
      return { error };
    },
    [supabase, courseId]
  );

  return {
    messages,
    loading,
    sendMessage,
    replyToMessage,
    refresh: fetchMessages,
  };
}
