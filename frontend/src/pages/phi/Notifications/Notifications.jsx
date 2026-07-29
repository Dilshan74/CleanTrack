import { useState } from "react";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import NotificationList from "../../../components/notifications/NotificationList";
import { PHI_NOTIFICATIONS } from "../../../utils/constants";

export default function Notifications() {
  const [items, setItems] = useState(() =>
    PHI_NOTIFICATIONS.map((item) => ({ ...item, read: false })),
  );

  const markRead = (id) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read");
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Assignments, overdue inspections and resolutions"
        action={
          <Button variant="outline" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />
      <NotificationList items={items} onRead={markRead} />
    </>
  );
}
