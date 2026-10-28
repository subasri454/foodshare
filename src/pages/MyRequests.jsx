
import React, { useState, useEffect, useCallback } from "react";
import { formatTime } from "../utils/formatTime";
import { useNavigate } from "react-router-dom";
import {
  Utensils,
  MapPin,
  CalendarDays,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function displayText(value, fallback = "Not specified") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.food_name ||
      value.foodName ||
      value.title ||
      fallback
    );
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString();
}

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function MyRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("foodshare_token") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Login session missing. Please login again.");
      }

      const response = await fetch(`${API_URL}/pickup-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load requests.");
      }

      const list = Array.isArray(result)
        ? result
        : result.requests || result.data || [];

      const safeRequests = list.map((request, index) => {
        const donation = request.donation || {};
        const donor = donation.donor || request.donor || {};

        return {
          ...request,
          id: request.id ?? `request-${index}`,
          foodName: displayText(
            donation.food_name || request.food_name,
            "Food"
          ),
          donor: displayText(
            donor.name || request.donor_name,
            "Donor"
          ),
          location: displayText(
            donation.location || request.location
          ),
          date: formatDate(
            request.pickup_date || request.created_at
          ),
          
time: formatTime(
  request.pickup_time ??
  request.pickupTime ??
  request.donation?.pickup_time ??
  request.donation?.pickupTime
),

          quantity: displayText(
            donation.quantity || request.quantity
          ),
          status: normalizeStatus(request.status),
          image: donation.image || "",
          description: donation.description || "",
        };
      });

      setRequests(safeRequests);
    } catch (err) {
      console.error("Unable to load pickup requests:", err);
      setError(err.message || "Unable to connect to the backend.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getStatusStyle = (status) => {
    switch (String(status).toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#f4f7f5]">
      {/* Fixed page header */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-[#f4f7f5] px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#063b2c]">
            My Requests
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View the food requests you have sent to donors
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-[#064b3a] px-3 py-2 font-semibold text-[#064b3a] transition hover:bg-[#064b3a] hover:text-white disabled:opacity-50 sm:px-4"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          <span>Refresh</span>
        </button>
      </header>

      {/* Only this section scrolls */}
      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-[#064b3a]"
            />
            <p className="mt-4 text-gray-500">
              Loading your requests...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
            <AlertCircle
              size={32}
              className="mx-auto text-red-500"
            />
            <h3 className="mt-4 text-xl font-bold text-gray-800">
              Unable to Load Requests
            </h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadRequests}
              className="mt-5 rounded-lg bg-[#064b3a] px-5 py-3 font-semibold text-white hover:bg-[#043729]"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Utensils
              size={32}
              className="mx-auto text-[#064b3a]"
            />
            <h3 className="mt-5 text-xl font-bold text-gray-800">
              No Requests Yet
            </h3>
            <p className="mt-2 text-gray-500">
              You haven't sent any food requests yet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/nearby-donations")}
              className="mt-5 rounded-lg bg-[#064b3a] px-5 py-3 font-semibold text-white hover:bg-[#043729]"
            >
              Browse Nearby Donations
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request, index) => (
              <div
                key={request.id ?? `request-${index}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ef]">
                      <Utensils
                        size={28}
                        className="text-[#064b3a]"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-bold text-gray-800">
                        {request.foodName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Request sent to{" "}
                        <span className="font-semibold text-gray-700">
                          {request.donor}
                        </span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} />
                          <span>{request.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={16} />
                          <span>{request.date}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock size={16} />
                          <span>{request.time}</span>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Quantity:{" "}
                        <span className="font-semibold text-gray-700">
                          {request.quantity}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/request-details", {
                          state: { request },
                        })
                      }
                      className="flex items-center gap-2 rounded-lg border border-[#064b3a] px-4 py-2.5 font-semibold text-[#064b3a] transition hover:bg-[#064b3a] hover:text-white"
                    >
                      <Eye size={17} />
                      View Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
