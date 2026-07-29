export const APP_NAME = "DengueGuard AI";

export const ROLES = {
  CITIZEN: "citizen",
  PHI: "phi",
  ADMIN: "admin",
};

export const ROLE_HOME = {
  [ROLES.CITIZEN]: "/citizen",
  [ROLES.PHI]: "/phi",
  [ROLES.ADMIN]: "/admin",
};

export const REPORT_STATUSES = [
  "Pending",
  "Under Review",
  "Accepted",
  "Inspection Scheduled",
  "Inspection Completed",
  "Resolved",
  "Rejected",
  "Escalated",
];

export const STATUS_TINT = {
  Pending: "bg-muted text-muted-foreground",
  "Under Review": "bg-info/15 text-info",
  Accepted: "bg-success/15 text-success",
  "Inspection Scheduled": "bg-primary/15 text-primary",
  "Inspection Completed": "bg-primary/15 text-primary",
  Resolved: "bg-success/15 text-success",
  Rejected: "bg-destructive/15 text-destructive",
  Escalated: "bg-warning/15 text-warning",
  Reviewed: "bg-info/15 text-info",
};

export const RISK_TINT = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-success/15 text-success",
};

export const RISK_MARKER = {
  High: "bg-destructive text-destructive-foreground",
  Medium: "bg-warning text-warning-foreground",
  Low: "bg-success text-success-foreground",
};

export const PREVENTION_TIPS = [
  "Empty water containers, buckets, and flower pots weekly.",
  "Cover water storage tanks and wells tightly.",
  "Clean roof gutters and drains regularly.",
  "Use mosquito repellents and wear long sleeves at dusk.",
  "Report stagnant water in your neighborhood immediately.",
];

export const WEATHER = {
  city: "Colombo",
  temp: 29,
  condition: "Thunderstorms",
  humidity: 82,
  rain: 68,
};

export const CITIZEN_REPORTS = [
  { id: "DG-1042", date: "2026-07-24", location: "Nugegoda, Ward 12", status: "Under Review", phi: "I. Perera", updated: "2h ago", risk: "High", image: "🪣" },
  { id: "DG-1039", date: "2026-07-22", location: "Rajagiriya, Ward 7", status: "Accepted", phi: "S. Fernando", updated: "1d ago", risk: "Medium", image: "🌱" },
  { id: "DG-1031", date: "2026-07-19", location: "Maharagama, Ward 4", status: "Inspection Scheduled", phi: "K. Silva", updated: "2d ago", risk: "High", image: "🛢️" },
  { id: "DG-1024", date: "2026-07-15", location: "Dehiwala, Ward 9", status: "Resolved", phi: "N. Jayasuriya", updated: "5d ago", risk: "Low", image: "🌿" },
  { id: "DG-1018", date: "2026-07-11", location: "Kotte, Ward 2", status: "Rejected", phi: "R. Wickrama", updated: "1w ago", risk: "Low", image: "💧" },
  { id: "DG-1011", date: "2026-07-08", location: "Battaramulla, Ward 5", status: "Pending", phi: "—", updated: "1w ago", risk: "Medium", image: "🪴" },
];

export const PHI_REPORTS = [
  { id: "DG-1042", name: "Nimal Perera", location: "Nugegoda, Ward 12", risk: "High", date: "2026-07-24", status: "Pending", image: "🪣" },
  { id: "DG-1041", name: "Anusha Silva", location: "Kotte, Ward 2", risk: "Medium", date: "2026-07-24", status: "Pending", image: "🌱" },
  { id: "DG-1040", name: "Kasun Fernando", location: "Rajagiriya, Ward 7", risk: "Low", date: "2026-07-23", status: "Reviewed", image: "🪴" },
  { id: "DG-1039", name: "Ishara J.", location: "Maharagama, Ward 4", risk: "High", date: "2026-07-23", status: "Accepted", image: "🛢️" },
  { id: "DG-1038", name: "Ruwan Bandara", location: "Dehiwala, Ward 9", risk: "Low", date: "2026-07-22", status: "Rejected", image: "💧" },
  { id: "DG-1037", name: "Sanduni P.", location: "Battaramulla, Ward 5", risk: "Medium", date: "2026-07-22", status: "Accepted", image: "🌿" },
];

export const NOTIFICATIONS = [
  { id: 1, type: "success", title: "Report Accepted", body: "DG-1039 was accepted by PHI S. Fernando.", time: "2h ago" },
  { id: 2, type: "info", title: "PHI Assigned", body: "Inspector K. Silva assigned to DG-1031.", time: "6h ago" },
  { id: 3, type: "success", title: "Inspection Completed", body: "Site cleared at Dehiwala Ward 9.", time: "1d ago" },
  { id: 4, type: "warning", title: "High Risk Alert", body: "Dengue cases rising near Nugegoda.", time: "1d ago" },
  { id: 5, type: "warning", title: "Weather Warning", body: "Heavy rain expected — check water storage.", time: "2d ago" },
  { id: 6, type: "info", title: "Inspection Scheduled", body: "PHI I. Perera will visit DG-1042 tomorrow at 10 AM.", time: "just now" },
  { id: 7, type: "warning", title: "Weather Warning", body: "Heavy showers forecast. Cover water storage.", time: "3d ago" },
];

export const PHI_NOTIFICATIONS = [
  { id: 1, type: "info", title: "New report assigned", body: "DG-1042 assigned to your queue.", time: "10m ago" },
  { id: 2, type: "warning", title: "Overdue inspection", body: "DG-1031 inspection is overdue by 1 day.", time: "2h ago" },
  { id: 3, type: "success", title: "Report resolved", body: "DG-1024 marked as resolved.", time: "1d ago" },
];

export const MONTHLY = [
  { name: "Jan", reports: 120, resolved: 96 },
  { name: "Feb", reports: 140, resolved: 118 },
  { name: "Mar", reports: 180, resolved: 155 },
  { name: "Apr", reports: 220, resolved: 190 },
  { name: "May", reports: 260, resolved: 224 },
  { name: "Jun", reports: 310, resolved: 268 },
  { name: "Jul", reports: 355, resolved: 302 },
];

export const RISK_DISTRIBUTION = [
  { name: "High", value: 32, color: "var(--destructive)" },
  { name: "Medium", value: 41, color: "var(--warning)" },
  { name: "Low", value: 27, color: "var(--success)" },
];

export const REPORT_STATUS_SPLIT = [
  { name: "Resolved", value: 62, color: "var(--success)" },
  { name: "In progress", value: 24, color: "var(--warning)" },
  { name: "Rejected", value: 14, color: "var(--destructive)" },
];

export const AREA_REPORTS = [
  { name: "Colombo", value: 320 },
  { name: "Gampaha", value: 240 },
  { name: "Kalutara", value: 180 },
  { name: "Kandy", value: 140 },
  { name: "Galle", value: 110 },
  { name: "Matara", value: 90 },
];

export const WEEKLY_INSPECTIONS = [
  { day: "Mon", visits: 12 },
  { day: "Tue", visits: 18 },
  { day: "Wed", visits: 15 },
  { day: "Thu", visits: 22 },
  { day: "Fri", visits: 19 },
  { day: "Sat", visits: 9 },
  { day: "Sun", visits: 4 },
];

export const AI_ACCURACY_TREND = [
  { m: "Jan", acc: 88.2 },
  { m: "Feb", acc: 89.1 },
  { m: "Mar", acc: 90.6 },
  { m: "Apr", acc: 91.3 },
  { m: "May", acc: 92.0 },
  { m: "Jun", acc: 92.8 },
  { m: "Jul", acc: 93.4 },
];

export const AI_CONFIDENCE_DISTRIBUTION = [
  { r: "0-20%", n: 3 },
  { r: "20-40%", n: 8 },
  { r: "40-60%", n: 22 },
  { r: "60-80%", n: 41 },
  { r: "80-100%", n: 126 },
];

export const USERS = [
  { id: "U-1001", name: "Nimal Perera", email: "nimal@example.lk", role: "Citizen", area: "Nugegoda", status: "Active", joined: "2025-11-02" },
  { id: "U-1002", name: "Anusha Silva", email: "anusha@example.lk", role: "Citizen", area: "Kotte", status: "Active", joined: "2026-01-14" },
  { id: "U-1003", name: "Kasun Fernando", email: "kasun@example.lk", role: "Citizen", area: "Dehiwala", status: "Inactive", joined: "2025-08-22" },
  { id: "U-1004", name: "Ishara Jayasuriya", email: "ishara@example.lk", role: "Citizen", area: "Maharagama", status: "Active", joined: "2026-03-11" },
  { id: "U-1005", name: "Ruwan Bandara", email: "ruwan@example.lk", role: "Citizen", area: "Battaramulla", status: "Active", joined: "2026-05-30" },
];

export const PHIS = [
  { id: "PHI-201", name: "I. Perera", email: "i.perera@moh.lk", area: "Nugegoda", inspections: 128, rating: 4.8, status: "Active" },
  { id: "PHI-202", name: "S. Fernando", email: "s.fernando@moh.lk", area: "Rajagiriya", inspections: 96, rating: 4.6, status: "Active" },
  { id: "PHI-203", name: "K. Silva", email: "k.silva@moh.lk", area: "Maharagama", inspections: 141, rating: 4.9, status: "Active" },
  { id: "PHI-204", name: "N. Jayasuriya", email: "n.jaya@moh.lk", area: "Dehiwala", inspections: 78, rating: 4.4, status: "On Leave" },
  { id: "PHI-205", name: "R. Wickrama", email: "r.wick@moh.lk", area: "Kotte", inspections: 63, rating: 4.2, status: "Active" },
];

export const AREAS = [
  { id: "A-01", name: "Nugegoda", risk: "High", phi: "I. Perera", reports: 82, x: 32, y: 45 },
  { id: "A-02", name: "Rajagiriya", risk: "Medium", phi: "S. Fernando", reports: 47, x: 55, y: 30 },
  { id: "A-03", name: "Maharagama", risk: "High", phi: "K. Silva", reports: 91, x: 22, y: 68 },
  { id: "A-04", name: "Dehiwala", risk: "Low", phi: "N. Jayasuriya", reports: 24, x: 68, y: 60 },
  { id: "A-05", name: "Kotte", risk: "Medium", phi: "R. Wickrama", reports: 39, x: 78, y: 42 },
  { id: "A-06", name: "Battaramulla", risk: "Low", phi: "R. Wickrama", reports: 18, x: 45, y: 75 },
  { id: "A-07", name: "Kaduwela", risk: "High", phi: "K. Silva", reports: 74, x: 88, y: 22 },
];

export const DETECTED_OBJECTS = [
  { label: "Stagnant water", conf: 96 },
  { label: "Discarded container", conf: 88 },
  { label: "Larvae indicators", conf: 71 },
  { label: "Vegetation debris", conf: 54 },
];

export const VISIT_CHECKLIST = [
  "Water Present",
  "Larvae Found",
  "Area Cleaned",
  "Chemical Applied",
  "Public Educated",
];
