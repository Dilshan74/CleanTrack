import { BellOff } from "lucide-react";
import NotificationItem from "./NotificationItem";
import EmptyState from "../common/EmptyState";

export default function NotificationList({ items, onRead }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={BellOff}
        title="No notifications"
        description="Updates from your PHI and the system will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <NotificationItem key={item.id} notification={item} onRead={onRead} />
      ))}
    </div>
  );
}
