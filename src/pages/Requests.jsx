import { useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Requests() {
  const API_URL = "http://localhost:5000/api";

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const getToken = () =>
    localStorage.getItem("foodshare_token") ||
    localStorage.getItem("token");

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  

  const normalizeStatus = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value === "accepted") return "Accepted";
    if (value === "rejected" || value === "cancelled") return "Rejected";
    if (value === "completed") return "Completed";
    return "Pending";
  };

  const normalizeRequest = (item) => {
    const donation = item.donation || {};
    const receiver = item.receiver || {};
    const dateValue = item.pickup_date || item.created_at;
    const receiverName =
      receiver.organization_name ||
      receiver.organization ||
      receiver.name ||
      receiver.full_name ||
      receiver.email ||
      "Receiver";

    return {
      id: item.id,
      food:
        donation.food_name ||
        donation.foodName ||
        item.food_name ||
        "Food donation",
      requester: receiverName,
      quantity: donation.quantity
        ? String(donation.quantity)
        : "—",
      location: donation.location || "—",
      date: formatDate(dateValue),
      time: formatTime(
  item.pickup_time ??
  item.pickupTime ??
  item.donation?.pickup_time ??
  item.donation?.pickupTime
),
      status: normalizeStatus(item.status),
      raw: item,
    };
  };

  const loadRequests = async () => {
    const token = getToken();

    if (!token) {
      setLoadError("Login session missing. Please login again.");
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(`${API_URL}/pickup-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load requests.");
      }

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result.requests)
          ? result.requests
          : Array.isArray(result.data)
            ? result.data
            : [];

      setRequests(list.map(normalizeRequest));
    } catch (error) {
      console.error("Load donor requests error:", error);
      setLoadError(error.message || "Unable to connect to the server.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    const token = getToken();

    if (!token) {
      setLoadError("Login session missing. Please login again.");
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/pickup-requests/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update request status.");
      }

      const updatedStatus = normalizeStatus(status);
      setRequests((previous) =>
        previous.map((request) =>
          request.id === id
            ? { ...request, status: updatedStatus }
            : request
        )
      );

      setSelectedRequest((previous) =>
        previous && previous.id === id
          ? { ...previous, status: updatedStatus }
          : previous
      );

      setLoadError("");
      return true;
    } catch (error) {
      console.error("Update pickup request error:", error);
      setLoadError(error.message || "Unable to update request.");
      return false;
    }
  };

  const handleAccept = async (id) => {
    await updateRequestStatus(id, "accepted");
  };

  const handleReject = async (id) => {
    await updateRequestStatus(id, "rejected");
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      selectedStatus === "All" || request.status === selectedStatus;
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(request.food || "").toLowerCase().includes(search) ||
      String(request.requester || "").toLowerCase().includes(search) ||
      String(request.location || "").toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;
  const acceptedRequests = requests.filter(
    (request) => request.status === "Accepted"
  ).length;
  const rejectedRequests = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7f5]">

      {/* =====================================================
          MAIN CONTENT

          Sidebar is already provided by Layout.jsx
      ===================================================== */}

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            fixed
            left-[280px]
            right-0
            top-0
            z-50
            h-[80px]
            border-b
            border-gray-200
            bg-[#f4f7f5]
            px-8
          "
        >
          <div className="flex h-full items-center">

            <div>
              <h1 className="text-3xl font-bold text-[#063b2c]">
                Requests
              </h1>

              <p className="mt-1 text-sm text-[#315b78]">
                Manage requests received for your food donations.
              </p>
            </div>

          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-10 pt-[105px]">

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <section className="mb-7 grid grid-cols-4 gap-5">

            {/* TOTAL */}

            <button
              type="button"
              onClick={() =>
                setSelectedStatus("All")
              }
              className={`
                w-full
                rounded-2xl
                border
                bg-white
                p-6
                text-left
                shadow-sm
                transition

                ${
                  selectedStatus === "All"
                    ? "border-green-500 ring-2 ring-green-100"
                    : "border-gray-200 hover:border-green-300"
                }
              `}
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-50
                  "
                >
                  <Package
                    size={28}
                    className="text-green-700"
                  />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalRequests}
                  </p>

                  <p className="font-semibold text-gray-900">
                    Total Requests
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    All requests
                  </p>
                </div>

              </div>
            </button>

            {/* PENDING */}

            <button
              type="button"
              onClick={() =>
                setSelectedStatus("Pending")
              }
              className={`
                w-full
                rounded-2xl
                border
                bg-white
                p-6
                text-left
                shadow-sm
                transition

                ${
                  selectedStatus === "Pending"
                    ? "border-orange-500 ring-2 ring-orange-100"
                    : "border-gray-200 hover:border-orange-300"
                }
              `}
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-50
                  "
                >
                  <Clock
                    size={28}
                    className="text-orange-500"
                  />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingRequests}
                  </p>

                  <p className="font-semibold text-gray-900">
                    Pending
                  </p>

                  <p className="mt-1 text-xs text-orange-500">
                    Awaiting response
                  </p>
                </div>

              </div>
            </button>

            {/* ACCEPTED */}

            <button
              type="button"
              onClick={() =>
                setSelectedStatus("Accepted")
              }
              className={`
                w-full
                rounded-2xl
                border
                bg-white
                p-6
                text-left
                shadow-sm
                transition

                ${
                  selectedStatus === "Accepted"
                    ? "border-green-500 ring-2 ring-green-100"
                    : "border-gray-200 hover:border-green-300"
                }
              `}
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-50
                  "
                >
                  <CheckCircle
                    size={28}
                    className="text-green-700"
                  />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {acceptedRequests}
                  </p>

                  <p className="font-semibold text-gray-900">
                    Accepted
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Requests accepted
                  </p>
                </div>

              </div>
            </button>

            {/* REJECTED */}

            <button
              type="button"
              onClick={() =>
                setSelectedStatus("Rejected")
              }
              className={`
                w-full
                rounded-2xl
                border
                bg-white
                p-6
                text-left
                shadow-sm
                transition

                ${
                  selectedStatus === "Rejected"
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-gray-200 hover:border-red-300"
                }
              `}
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                  "
                >
                  <XCircle
                    size={28}
                    className="text-red-500"
                  />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {rejectedRequests}
                  </p>

                  <p className="font-semibold text-gray-900">
                    Rejected
                  </p>

                  <p className="mt-1 text-xs text-red-500">
                    Requests rejected
                  </p>
                </div>

              </div>
            </button>

          </section>

          {/* =================================================
              REQUEST TABLE
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >

            {/* SEARCH */}

            <div
              className="
                border-b
                border-gray-200
                p-5
              "
            >
              <div className="relative w-[360px]">

                <Search
                  size={20}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    py-3
                    pl-11
                    pr-4
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-200
                  "
                />

              </div>
            </div>

            {/* TABLE HEADER */}

            <div
              className="
                grid
                grid-cols-[2fr_1.5fr_1fr_1.3fr_1fr_180px]
                border-b
                border-gray-200
                bg-gray-50
                px-5
                py-4
                text-sm
                font-semibold
                text-gray-700
              "
            >
              <div>Food Item</div>
              <div>Requester</div>
              <div>Quantity</div>
              <div>Pickup</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* REQUEST ROWS */}

            {loadError && (
              <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
                {loadError}
                <button
                  type="button"
                  onClick={loadRequests}
                  className="ml-3 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500">
                Loading requests...
              </div>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="
                      grid
                      grid-cols-[2fr_1.5fr_1fr_1.3fr_1fr_180px]
                      items-center
                      border-b
                      border-gray-100
                      px-5
                      py-5
                      transition
                      hover:bg-gray-50
                    "
                  >

                    {/* FOOD */}

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl
                          bg-green-50
                        "
                      >
                        <Package
                          size={24}
                          className="text-green-700"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {request.food}
                        </p>

                        <div
                          className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-gray-500
                          "
                        >
                          <MapPin size={13} />

                          {request.location}
                        </div>
                      </div>

                    </div>

                    {/* REQUESTER */}

                    <div className="font-medium text-gray-800">
                      {request.requester}
                    </div>

                    {/* QUANTITY */}

                    <div className="text-sm font-semibold text-gray-800">
                      {request.quantity}
                    </div>

                    {/* PICKUP */}

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {request.date}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {request.time}
                      </p>
                    </div>

                    {/* STATUS */}

                    <div>

                      {request.status ===
                        "Pending" && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-orange-50
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-orange-600
                          "
                        >
                          <span className="h-2 w-2 rounded-full bg-orange-500" />

                          Pending
                        </span>
                      )}

                      {request.status ===
                        "Accepted" && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-green-50
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-green-700
                          "
                        >
                          <span className="h-2 w-2 rounded-full bg-green-600" />

                          Accepted
                        </span>
                      )}

                      {request.status ===
                        "Rejected" && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-red-50
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-red-600
                          "
                        >
                          <span className="h-2 w-2 rounded-full bg-red-500" />

                          Rejected
                        </span>
                      )}

                      {request.status === "Completed" && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Completed
                        </span>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRequest(
                            request
                          )
                        }
                        className="
                          rounded-lg
                          border
                          border-green-500
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-green-700
                          transition
                          hover:bg-green-50
                        "
                      >
                        View
                      </button>

                    </div>

                  </div>
                )
              )
            ) : (
              <div className="py-16 text-center">

                <Package
                  size={45}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  No requests found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or status filter.
                </p>

              </div>
            )}

          </section>

        </div>
      </main>

      {/* =====================================================
          REQUEST DETAILS POPUP
      ===================================================== */}

      {selectedRequest && (
        <div
          className="
            fixed
            inset-0
            z-[1000]
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >

          <div
            className="
              w-full
              max-w-[480px]
              rounded-2xl
              bg-white
              p-7
              shadow-2xl
            "
          >

            {/* POPUP HEADER */}

            <div
              className="
                flex
                items-center
                gap-3
                border-b
                border-gray-200
                pb-4
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-50
                "
              >
                <Package
                  size={25}
                  className="text-green-700"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#063b2c]">
                  Request Details
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedRequest.food}
                </p>
              </div>

            </div>

            {/* DETAILS */}

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs text-gray-500">
                  Requester
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.requester}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Quantity Requested
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.quantity}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Pickup Location
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-gray-500">
                    Pickup Date
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedRequest.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Pickup Time
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedRequest.time}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Current Status
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.status}
                </p>
              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                }}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Close
              </button>

              {/* CANCEL REQUEST */}

              {selectedRequest.status ===
                "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    handleReject(
                      selectedRequest.id
                    );

                    setSelectedRequest(null);
                  }}
                  className="
                    rounded-lg
                    border
                    border-red-300
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-red-500
                    hover:bg-red-50
                  "
                >
                  Cancel Request
                </button>
              )}

              {/* ACCEPT */}

              {selectedRequest.status ===
                "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    handleAccept(
                      selectedRequest.id
                    );

                    setSelectedRequest(null);
                  }}
                  className="
                    rounded-lg
                    bg-green-600
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-green-700
                  "
                >
                  Accept Request
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}