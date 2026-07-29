// Helpers for the portal ("view") controllers that return data already shaped
// for the frontend (raw arrays/objects, not the { success, data } envelope).

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function relativeTime(value) {
    if (!value) return "";
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Math.max(0, Date.now() - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// Map a stored notification into the shape the frontend expects.
function toNotificationCard(n) {
    return {
        id: n._id,
        title: n.title,
        body: n.message,
        time: relativeTime(n.createdAt),
        unread: !n.isRead,
        tone: "primary",
    };
}

module.exports = { formatDate, formatTime, relativeTime, toNotificationCard };
