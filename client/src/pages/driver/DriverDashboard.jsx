import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Clock, Truck, TrendingUp, Route as RouteIcon, Info } from "lucide-react";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import driverService from "../../services/driverService";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function Stat({ icon: Icon, label, value, hint, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const firstName = (user?.name || "Driver").split(" ")[0];

  const fetchDashboard = () => {
    driverService.getDashboard().then(setData).catch(console.error);
  };

  useEffect(() => {
    fetchDashboard();

    // Setup Socket.IO for real-time updates
    const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socket.on("connect", () => {
      console.log("Dashboard socket connected");
    });

    socket.on("assignment_updated", fetchDashboard);
    socket.on("route_started", fetchDashboard);
    socket.on("route_ended", fetchDashboard);
    
    return () => {
      socket.disconnect();
    };
  }, []);

  if (!data) return <Loader label="Loading dashboard…" />;

  const isCompleted = data.collectionStatus === "Completed";
  const hasNoWork = !data.routeId || data.route === "No route assigned" || isCompleted;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayRoute = isCompleted ? "No route assigned" : data.route;
  const displayTruck = isCompleted ? "No truck assigned" : data.truck;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{getGreeting()}, {firstName}</h1>
        <p className="text-muted-foreground">
          {displayTruck !== "No truck assigned" ? `Truck ${displayTruck} · ` : ""}{displayRoute}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat icon={RouteIcon} label="Total Trips" value={data.totalTrips || 0} />
        <Stat icon={CheckCircle2} label="Completed Trips" value={data.completedTrips || 0} tone="success" />
        <Stat icon={Truck} label="Truck" value={displayTruck} />
        <Stat icon={MapPin} label="Route" value={displayRoute} tone="warning" />
      </div>

      {hasNoWork ? (
        <div className="rounded-xl border bg-card p-10 flex flex-col items-center justify-center text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No new collection work has been assigned yet.</h2>
            <p className="text-muted-foreground">Please wait for the Admin to assign you a new route or truck.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-4">Route progress (Mileage)</h2>
            <div className="h-3 rounded-full bg-muted overflow-hidden mb-6">
              <div className="h-full bg-primary" style={{ width: `${data.progress}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted p-3"><div className="text-2xl font-bold">{data.progress}%</div><div className="text-xs text-muted-foreground">Complete</div></div>
              <div className="rounded-lg bg-muted p-3"><div className="text-2xl font-bold">{data.completedMileage} km</div><div className="text-xs text-muted-foreground">Completed</div></div>
              <div className="rounded-lg bg-muted p-3"><div className="text-2xl font-bold">{data.totalMileage} km</div><div className="text-xs text-muted-foreground">Total</div></div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Announcements</h2>
            {data.announcements && data.announcements.length > 0 ? (
                <ul className="space-y-3 text-sm">
                {data.announcements.map((a) => (
                    <li 
                      key={a.id} 
                      className="rounded-lg bg-muted p-3 cursor-pointer hover:bg-muted/80 transition"
                      onClick={() => navigate("/driver/notifications")}
                    >
                        <div className="font-semibold mb-1 truncate">{a.title}</div>
                        <div className="text-muted-foreground truncate">{a.message}</div>
                    </li>
                ))}
                </ul>
            ) : (
                <div className="text-muted-foreground text-sm">No announcements</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
