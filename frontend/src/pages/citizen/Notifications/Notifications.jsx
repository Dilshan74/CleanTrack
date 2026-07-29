import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import NotificationList from "../../../components/notifications/NotificationList";
import useNotification from "../../../hooks/useNotification";

export default function Notifications() {
  const { items, unreadCount, markRead, markAllRead } = useNotification();

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${items.length} recent updates · ${unreadCount} unread`}
        action={
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        }
      />
      <NotificationList items={items} onRead={markRead} />
    </>
  );
}
