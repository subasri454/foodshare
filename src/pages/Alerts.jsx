import {
  Bell,
  Clock3,
  CheckCircle2,
  CheckCheck,
  MoreVertical,
} from "lucide-react";

import { useState } from "react";
import NotificationModal from "../components/NotificationModal";
import { Link } from "react-router-dom";

export default function Alerts() {
  const [selectedNotification, setSelectedNotification] = useState(null);

  const notifications = [
    {
      type: "pickup",
      title: "New Pickup Request",
      message:
        "Hope Foundation has requested your Wedding Feast donation.",
      time: "5 min ago",
      unread: true,
    },
    {
      type: "accepted",
      title: "Request Accepted!",
      message:
        "Your request for Fresh Vegetable Pulav has been accepted. Pickup by 7 PM.",
      time: "1 hour ago",
      unread: true,
    },
    {
      type: "reminder",
      title: "Pickup Reminder",
      message:
        "Don't forget! Pickup deadline for Birthday Party Snacks is at 8 PM today.",
      time: "2 hours ago",
      unread: true,
    },
    {
      type: "completed",
      title: "Donation Completed",
      message:
        "Your tandoori platter has been successfully picked up. Thank you!",
      time: "Yesterday",
      unread: false,
    },
  ];

  const getIcon = (type) => {
    if (type === "pickup") {
      return <Bell size={28} strokeWidth={2.4} />;
    }

    if (type === "accepted") {
      return <CheckCircle2 size={28} strokeWidth={2.4} />;
    }

    if (type === "reminder") {
      return <Clock3 size={28} strokeWidth={2.4} />;
    }

    return <CheckCheck size={28} strokeWidth={2.4} />;
  };

  const getIconStyle = (type) => {
    if (type === "pickup") {
      return "bg-orange-50 text-orange-500";
    }

    if (type === "accepted") {
      return "bg-green-50 text-green-600";
    }

    if (type === "reminder") {
      return "bg-amber-50 text-amber-500";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] p-8">

      {/* ================= HEADER ================= */}
      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#063b2c]">
            <Bell
              size={25}
              className="text-white"
              strokeWidth={2.4}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[#063b2c]">
              Notifications
            </h1>

            <p className="text-sm text-gray-500">
              Stay updated with your food donations and requests
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-[#16a34a] bg-white px-5 py-3 text-sm font-semibold text-[#063b2c] shadow-sm hover:bg-green-50"
        >
          <CheckCheck size={18} />
          Mark all as read
        </button>

      </div>


      {/* ================= STATISTICS ================= */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* TOTAL */}
        <div className="flex min-h-[125px] items-center justify-between rounded-2xl bg-white px-7 shadow-sm">

          <div>
            <p className="text-base font-medium text-gray-500">
              Total Notifications
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[#063b2c]">
              12
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              All time
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#063b2c]">
            <Bell size={26} />
          </div>

        </div>


        {/* UNREAD */}
        <div className="flex min-h-[125px] items-center justify-between rounded-2xl bg-white px-7 shadow-sm">

          <div>
            <p className="text-base font-medium text-gray-500">
              Unread
            </p>

            <h2 className="mt-2 text-4xl font-bold text-green-600">
              3
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              New updates
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
            <span className="h-4 w-4 rounded-full bg-green-500" />
          </div>

        </div>


        {/* THIS WEEK */}
        <div className="flex min-h-[125px] items-center justify-between rounded-2xl bg-white px-7 shadow-sm">

          <div>
            <p className="text-base font-medium text-gray-500">
              This Week
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[#063b2c]">
              8
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Last 7 days
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#063b2c]">
            <Clock3 size={26} />
          </div>

        </div>

      </div>


      {/* ================= RECENT NOTIFICATIONS ================= */}
      <div className="rounded-2xl bg-white p-7 shadow-sm">

        {/* CARD HEADER */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold text-[#063b2c]">
              Recent Notifications
            </h2>

            <p className="mt-1 text-base text-gray-500">
              Your latest activity and updates
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <MoreVertical size={22} />
          </button>

        </div>


        {/* NOTIFICATION LIST */}
        <div className="space-y-4">

          {notifications.map((notification, index) => {

            const card = (
              <div
                className={`relative flex min-h-[135px] w-full items-center gap-5 rounded-2xl border p-6 transition hover:shadow-md ${
                  notification.unread
                    ? "border-green-100 bg-[#fbfffc]"
                    : "border-gray-100 bg-white"
                }`}
              >

                {/* ICON */}
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${getIconStyle(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>


                {/* CONTENT */}
                <div className="flex-1">

                  <div className="flex items-center gap-3">

                    <h3 className="text-xl font-bold text-gray-900">
                      {notification.title}
                    </h3>

                    {notification.type === "accepted" && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Accepted
                      </span>
                    )}

                    {notification.type === "completed" && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        Completed
                      </span>
                    )}

                  </div>


                  <p className="mt-2 text-base text-gray-600">
                    {notification.message}
                  </p>


                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                    <Clock3 size={15} />
                    {notification.time}
                  </div>

                </div>


                {/* UNREAD DOT */}
                {notification.unread && (
                  <span className="absolute right-6 top-6 h-3.5 w-3.5 rounded-full bg-green-500" />
                )}


                {/* VIEW BUTTON */}
                {notification.type === "pickup" ? (

                  /* FIRST BUTTON — KEEP AS PAGE LINK */
                  <span className="absolute bottom-5 right-6 text-sm font-semibold text-[#063b2c]">
                    View
                  </span>

                ) : (

                  /* OTHER 3 BUTTONS — OPEN MODAL */
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNotification(notification.type)
                    }
                    className="absolute bottom-5 right-6 text-sm font-semibold text-[#063b2c] hover:underline"
                  >
                    View
                  </button>

                )}

              </div>
            );


            {/* NEW PICKUP REQUEST → EXISTING PAGE */}
            if (notification.type === "pickup") {
              return (
                <Link
                  key={index}
                  to="/pickup-request"
                  className="block"
                >
                  {card}
                </Link>
              );
            }


            {/* OTHER NOTIFICATIONS */}
            return (
              <div key={index}>
                {card}
              </div>
            );

          })}

        </div>

      </div>


      {/* ================= NOTIFICATION MODAL ================= */}
      {selectedNotification && (
        <NotificationModal
          type={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

    </div>
  );
}
