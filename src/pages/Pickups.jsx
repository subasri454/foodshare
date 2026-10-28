
import { useEffect, useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function getToken() {
  return (
    localStorage.getItem("foodshare_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function formatDate(value) {
  if (!value) return "Not scheduled";

  const raw = String(value);

  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Converts SQL time values to 12-hour format with AM/PM.
// Examples: 20:00 -> 08:00 PM, 08:00 -> 08:00 AM.
function formatTime(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not scheduled";
  }

  const raw = String(value).trim();

  // SQL TIME: HH:mm or HH:mm:ss
  const sqlTimeMatch = raw.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/
  );

  if (sqlTimeMatch) {
    let hour = Number(sqlTimeMatch[1]);
    const minute = Number(sqlTimeMatch[2]);

    if (hour > 23 || minute > 59) {
      return "Not scheduled";
    }

    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")} ${period}`;
  }

  // Time that already contains AM/PM.
  const twelveHourMatch = raw.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (
      hour < 1 ||
      hour > 12 ||
      minute > 59
    ) {
      return "Not scheduled";
    }

    return `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")} ${period}`;
  }

  // Full date/time value, for example 2026-10-25T20:00:00.
  const date = new Date(raw);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return "Not scheduled";
}

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();

  const labels = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
}

function getStatusStyle(status) {
  const styles = {
    Pending: "bg-orange-50 text-orange-600",
    Accepted: "bg-blue-50 text-blue-700",
    Completed: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-600",
    Cancelled: "bg-red-50 text-red-600",
  };

  return styles[status] || "bg-gray-100 text-gray-600";
}

function mapPickup(request) {
  const donation = request.donation || {};
  const receiver = request.receiver || {};

  const pickupTime =
    request.pickup_time ||
    donation.pickup_time ||
    null;

  const pickupDate =
    request.pickup_date ||
    donation.pickup_date ||
    null;

  const createdAt = request.created_at || null;

  return {
    id: request.id,

    food:
      donation.food_name ||
      request.food_name ||
      "Food donation",

    receiver:
      receiver.name ||
      receiver.full_name ||
      receiver.organization_name ||
      receiver.email ||
      "Receiver",

    quantity: donation.quantity
      ? String(donation.quantity)
      : request.quantity
        ? String(request.quantity)
        : "Not specified",

    location:
      donation.location ||
      request.location ||
      "Location not specified",

    date: formatDate(pickupDate || createdAt),

    time: formatTime(pickupTime),

    status: normalizeStatus(request.status),
  };
}

export default function Pickups() {
  const [pickups, setPickups] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchPickups = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please log in again to view your pickups."
        );
      }

      const response = await fetch(
        `${API_URL}/pickup-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("PICKUP API DATA:", data.requests);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load pickup requests."
        );
      }

      const requests = Array.isArray(data.requests)
        ? data.requests
        : [];

      setPickups(requests.map(mapPickup));
    } catch (error) {
      setLoadError(
        error.message ||
          "Unable to connect to the FoodShare backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const markAsCompleted = async (pickup) => {
    const confirmed = window.confirm(
      `Confirm that "${pickup.food}" has been picked up and delivered?`
    );

    if (!confirmed) return;

    setUpdatingId(pickup.id);
    setActionMessage("");
    setActionError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/pickup-requests/${pickup.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "completed",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not complete this pickup."
        );
      }

      setPickups((current) =>
        current.map((item) =>
          item.id === pickup.id
            ? { ...item, status: "Completed" }
            : item
        )
      );

      setSelectedPickup((current) =>
        current && current.id === pickup.id
          ? { ...current, status: "Completed" }
          : current
      );

      setActionMessage(
        `${pickup.food} marked as completed successfully.`
      );

      await fetchPickups(true);
    } catch (error) {
      setActionError(
        error.message || "Failed to update pickup status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPickups = pickups.filter((pickup) => {
    const matchesStatus =
      selectedStatus === "All" ||
      pickup.status === selectedStatus;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      pickup.food.toLowerCase().includes(search) ||
      pickup.receiver.toLowerCase().includes(search) ||
      pickup.location.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  const countStatus = (status) =>
    pickups.filter((pickup) => pickup.status === status).length;

  const summaryCards = [
    {
      title: "Total Pickups",
      count: pickups.length,
      subtitle: "All pickup requests",
      filter: "All",
      icon: Package,
      iconStyle: "bg-green-50 text-green-700",
    },
    {
      title: "Pending",
      count: countStatus("Pending"),
      subtitle: "Awaiting response",
      filter: "Pending",
      icon: Clock,
      iconStyle: "bg-orange-50 text-orange-500",
    },
    {
      title: "Completed",
      count: countStatus("Completed"),
      subtitle: "Successfully completed",
      filter: "Completed",
      icon: CheckCircle,
      iconStyle: "bg-green-50 text-green-700",
    },
    {
      title: "Cancelled",
      count: countStatus("Cancelled"),
      subtitle: "Cancelled requests",
      filter: "Cancelled",
      icon: XCircle,
      iconStyle: "bg-red-50 text-red-500",
    },
  ];

  return (
   <div className="h-full min-h-0 w-full min-w-0 bg-[#f4f7f5]">
  <main className="h-full min-h-0 w-full min-w-0 overflow-y-auto">
        <header className="fixed top-0 left-[280px] right-0 z-50 h-[95px] border-b border-gray-200 bg-[#f4f7f5] px-8">
          <div className="flex h-full items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#063b2c]">
                Pickups
              </h1>
              <p className="mt-1 text-base text-[#315b78]">
                Track and manage your food pickup requests.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchPickups(true)}
              disabled={loading || refreshing}
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="px-8 pb-10 pt-[125px]">
          {loadError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={21} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  Could not load pickups
                </p>
                <p className="mt-1 text-sm">{loadError}</p>
                <button
                  type="button"
                  onClick={() => fetchPickups()}
                  className="mt-2 text-sm font-bold underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {actionMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
              <CheckCircle size={20} />
              <p className="text-sm font-semibold">
                {actionMessage}
              </p>
            </div>
          )}

          {actionError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={20} />
              <p className="text-sm font-semibold">
                {actionError}
              </p>
            </div>
          )}

          <section className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const active = selectedStatus === card.filter;

              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => setSelectedStatus(card.filter)}
                  className={`w-full rounded-2xl border bg-white p-6 text-left shadow-sm transition ${
                    active
                      ? "border-green-500 ring-2 ring-green-100"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}
                    >
                      <Icon size={28} />
                    </div>

                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {loading ? "—" : card.count}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {card.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
              <div className="relative w-full max-w-[360px]">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search pickups..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>

              <p className="text-sm text-gray-500">
                {loading
                  ? "Loading pickups..."
                  : `${filteredPickups.length} pickups`}
              </p>
            </div>

            <div className="hidden grid-cols-[2fr_1.5fr_1fr_1.3fr_1fr_190px] border-b border-gray-200 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-700 xl:grid">
              <div>Food Item</div>
              <div>Receiver</div>
              <div>Quantity</div>
              <div>Pickup</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {loading && (
              <div className="py-14 text-center text-gray-500">
                <RefreshCw
                  size={25}
                  className="mx-auto mb-3 animate-spin text-green-700"
                />
                Loading pickup requests...
              </div>
            )}

            {!loading &&
              !loadError &&
              filteredPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className="grid grid-cols-1 items-center gap-4 border-b border-gray-100 px-5 py-5 transition hover:bg-gray-50 xl:grid-cols-[2fr_1.5fr_1fr_1.3fr_1fr_190px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
                      <Package
                        size={24}
                        className="text-green-700"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {pickup.food}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} />
                        {pickup.location}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 xl:hidden">
                      Receiver
                    </p>
                    <p className="font-medium text-gray-800">
                      {pickup.receiver}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 xl:hidden">
                      Quantity
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {pickup.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 xl:hidden">
                      Pickup
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {pickup.date}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {pickup.time}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500 xl:hidden">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${getStatusStyle(pickup.status)}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {pickup.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPickup(pickup);
                        setActionError("");
                        setActionMessage("");
                      }}
                      className="rounded-lg border border-green-500 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                    >
                      View
                    </button>

                    {pickup.status === "Accepted" && (
                      <button
                        type="button"
                        disabled={updatingId === pickup.id}
                        onClick={() => markAsCompleted(pickup)}
                        className="flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCheck size={16} />
                        {updatingId === pickup.id
                          ? "Saving..."
                          : "Complete"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {!loading &&
              !loadError &&
              filteredPickups.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <Package
                    size={42}
                    className="mx-auto mb-3 text-gray-300"
                  />
                  <p className="font-semibold text-gray-700">
                    {pickups.length === 0
                      ? "No pickup requests yet."
                      : "No pickups found."}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {pickups.length === 0
                      ? "Receiver requests will appear here when someone requests your food."
                      : "Try another status filter or search term."}
                  </p>

                  {selectedStatus !== "All" && (
                    <button
                      type="button"
                      onClick={() => setSelectedStatus("All")}
                      className="mt-4 font-semibold text-green-700 hover:underline"
                    >
                      Show all pickups
                    </button>
                  )}
                </div>
              )}
          </section>
        </div>
      </main>

      {selectedPickup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Package
                  size={25}
                  className="text-green-700"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#063b2c]">
                  Pickup Details
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedPickup.food}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500">Receiver</p>
                <p className="font-semibold text-gray-800">
                  {selectedPickup.receiver}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-semibold text-gray-800">
                  {selectedPickup.quantity}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Pickup Location
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedPickup.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Pickup Date
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedPickup.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Pickup Time
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedPickup.time}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold ${getStatusStyle(selectedPickup.status)}`}
                >
                  {selectedPickup.status}
                </span>
              </div>
            </div>

            {selectedPickup.status === "Accepted" && (
              <button
                type="button"
                disabled={updatingId === selectedPickup.id}
                onClick={() => markAsCompleted(selectedPickup)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                <CheckCheck size={18} />
                {updatingId === selectedPickup.id
                  ? "Saving..."
                  : "Mark as Completed"}
              </button>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPickup(null)}
                className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
