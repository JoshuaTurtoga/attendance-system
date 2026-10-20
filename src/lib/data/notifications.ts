import type { SupabaseClient } from "@supabase/supabase-js";
import type { Notification } from "@/types";

export interface NotificationRow {
  id: string;
  recipient_id: string;
  class_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export const NOTIFICATION_COLUMNS =
  "id,recipient_id,class_id,kind,title,body,is_read,created_at";

export function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    classId: row.class_id ?? undefined,
    kind: row.kind,
    title: row.title,
    body: row.body ?? undefined,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function listNotifications(
  client: SupabaseClient,
  userId: string
): Promise<Notification[]> {
  const { data, error } = await client
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as NotificationRow[] | null ?? []).map(mapNotificationRow);
}

export async function markNotificationRead(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Streams newly inserted notifications for a user over Supabase Realtime.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  client: SupabaseClient,
  userId: string,
  onInsert: (notification: Notification) => void
): () => void {
  const channel = client
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => onInsert(mapNotificationRow(payload.new as NotificationRow))
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
