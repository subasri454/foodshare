
import { useEffect, useState, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Trash2,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function MyDonations() {
  const { t } = useSettings();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteDonation, setDeleteDonation] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () =>
    localStorage.getItem("foodshare_token") ||
    localStorage.getItem("token");

  // FETCH DONATIONS FROM DATABASE
  const fetchDonations = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setLoadError(t("Please log in again to view your donations."));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(`${API_URL}/donations/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            t("Unable to load donations.")
        );
      }

      if (!Array.isArray(data.donations)) {
        throw new Error(
          t("Unexpected response from the donations API.")
        );
      }

      const statusMap = {
        available: "Pending",
        reserved: "Pending",
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled",
      };

      const formattedDonations = data.donations.map((item) => {
        const quantityText = String(item.quantity ?? "").trim();

        const quantityMatch = quantityText.match(
          /^(\d+(?:\.\d+)?)\s*(.*)$/
        );

        const createdAt = item.created_at
          ? new Date(item.created_at)
          : item.createdAt
            ? new Date(item.createdAt)
            : null;

        const validDate =
          createdAt && !Number.isNaN(createdAt.getTime());

        return {
          id: item.id,
          name: item.food_name || item.foodName || t("Unnamed Food"),
          location: item.location || t("Location not provided"),

          quantity: quantityMatch
            ? quantityMatch[1]
            : quantityText || "0",

          unit: quantityMatch
            ? quantityMatch[2] || t("Quantity")
            : t("Quantity"),

          status:
            statusMap[String(item.status || "").toLowerCase()] ||
            "Pending",

          originalStatus: item.status,

          date: validDate
            ? createdAt.toLocaleDateString(
                t("en-IN") === "en-IN" ? "en-IN" : "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : t("Not available"),

          time: validDate
            ? createdAt.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",

          preparationDate:
            item.preparation_date || item.preparationDate || "",

          preparationTime:
            item.preparation_time || item.preparationTime || "",

          expiryDate:
            item.expiry_date || item.expiryDate || "",

          expiryTime:
            item.expiry_time || item.expiryTime || "",

          pickupDate:
            item.pickup_date || item.pickupDate || "",

          pickupTime:
            item.pickup_time || item.pickupTime || "",

          description: item.description || "",
          image: item.image || item.image_url || "",
        };
      });

      setDonations(formattedDonations);
    } catch (error) {
      console.error("Fetch donations error:", error);

      setLoadError(
        error.message ||
          t("Could not load donations. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // VIEW DONATION
  const handleView = (donation) => {
    navigate("/pickup-request", {
      state: {
        sidebar: "donor",
        userRole: "donor",
        food: {
          id: donation.id,

          title:
            donation.name ||
            donation.food_name ||
            donation.title ||
            "Food",

          details: `${donation.quantity || ""} ${
            donation.unit || ""
          }`.trim(),

          quantity: donation.quantity,
          unit: donation.unit,

          preparationDate:
            donation.preparationDate ||
            donation.preparation_date ||
            "",

          preparationTime:
            donation.preparationTime ||
            donation.preparation_time ||
            "",

          expiryDate:
            donation.expiryDate ||
            donation.expiry_date ||
            "",

          expiryTime:
            donation.expiryTime ||
            donation.expiry_time ||
            "",

          pickupDate:
            donation.pickupDate ||
            donation.pickup_date ||
            "",

          pickupTime:
            donation.pickupTime ||
            donation.pickup_time ||
            "",

          foodType:
            donation.foodType ||
            donation.food_type ||
            t("Not provided"),

          category:
            donation.category ||
            donation.food_category ||
            t("Not provided"),

          condition:
            donation.condition ||
            donation.food_condition ||
            t("Not provided"),

          storage: donation.storage || t("Not provided"),

          allergens: donation.allergens || t("Not provided"),

          foodDescription:
            donation.description ||
            donation.detailed_description ||
            `${t("Food donation")}: ${
              donation.name || donation.food_name || "Food"
            }.`,

          pickupLocation:
            donation.pickupLocation ||
            donation.pickup_location ||
            donation.location ||
            "",

          pickupInstructions:
            donation.pickupInstructions ||
            donation.pickup_instructions ||
            t(
              "Please confirm pickup arrangements before collecting the food."
            ),

          contactPerson:
            donation.contactPerson ||
            donation.contact_person ||
            "",

          contactPhone:
            donation.contactPhone ||
            donation.contact_phone ||
            "",

          email: donation.email || "",
          image: donation.image || "",
        },
      },
    });
  };

  // DELETE DONATION FROM DATABASE
  const handleDelete = async () => {
    if (!deleteDonation || deleting) return;

    const token = getToken();

    if (!token) {
      setLoadError(
        t("Please log in again to delete this donation.")
      );
      return;
    }

    try {
      setDeleting(true);
      setLoadError("");

      const response = await fetch(
        `${API_URL}/donations/${encodeURIComponent(
          String(deleteDonation.id)
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `${t("Delete failed")} (HTTP ${response.status}).`
        );
      }

      // Update the UI only after the backend confirms deletion.
      setDonations((previous) =>
        previous.filter(
          (item) =>
            String(item.id) !== String(deleteDonation.id)
        )
      );

      setDeleteDonation(null);
    } catch (error) {
      console.error("Delete donation error:", error);

      setLoadError(
        error.message ||
          t("Could not delete the donation. Please try again.")
      );
    } finally {
      setDeleting(false);
    }
  };

  // SEARCH AND FILTER
  const filteredDonations = donations.filter((donation) => {
    const matchesStatus =
      selectedStatus === "All" ||
      donation.status === selectedStatus;

    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      donation.name.toLowerCase().includes(search) ||
      donation.location.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  // STATISTICS
  const totalDonations = donations.length;

  const completedDonations = donations.filter(
    (donation) => donation.status === "Completed"
  ).length;

  const pendingDonations = donations.filter(
    (donation) => donation.status === "Pending"
  ).length;

  const cancelledDonations = donations.filter(
    (donation) => donation.status === "Cancelled"
  ).length;

  // STATUS BADGE
  const renderStatus = (status) => {
    const styles = {
      Completed: {
        wrapper: "bg-green-50 text-green-700",
        dot: "bg-green-600",
      },
      Pending: {
        wrapper: "bg-orange-50 text-orange-600",
        dot: "bg-orange-500",
      },
      Cancelled: {
        wrapper: "bg-red-50 text-red-600",
        dot: "bg-red-500",
      },
    };

    const style = styles[status] || styles.Pending;

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${style.wrapper}`}
      >
        <span
          className={`h-2 w-2 rounded-full ${style.dot}`}
        />
        {t(status)}
      </span>
    );
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f4f7f5]">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="fixed left-[280px] right-0 top-0 z-50 h-[80px] border-b border-gray-200 bg-[#f4f7f5] px-8">
          <div className="flex h-full items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#063b2c]">
                {t("My Donations")}
              </h1>

              <p className="mt-1 text-sm text-[#315b78]">
                {t(
                  "View and manage all the food donations you have posted."
                )}
              </p>
            </div>

            <Link
              to="/donate-food"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={20} />
              <span>{t("New Donation")}</span>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-10 pt-[105px]">
          {/* STATISTICS */}
          <section className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => setSelectedStatus("All")}
              className={`w-full rounded-2xl border bg-white p-6 text-left shadow-sm transition ${
                selectedStatus === "All"
                  ? "border-green-500 ring-2 ring-green-100"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                  <Package size={28} className="text-green-700" />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalDonations}
                  </p>

                  <p className="font-semibold text-gray-900">
                    {t("Total Donations")}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {t("All donations")}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("Completed")}
              className={`w-full rounded-2xl border bg-white p-6 text-left shadow-sm transition ${
                selectedStatus === "Completed"
                  ? "border-green-500 ring-2 ring-green-100"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                  <CheckCircle
                    size={28}
                    className="text-green-700"
                  />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {completedDonations}
                  </p>

                  <p className="font-semibold text-gray-900">
                    {t("Completed")}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    {t("Successfully delivered")}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("Pending")}
              className={`w-full rounded-2xl border bg-white p-6 text-left shadow-sm transition ${
                selectedStatus === "Pending"
                  ? "border-orange-500 ring-2 ring-orange-100"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50">
                  <Clock size={28} className="text-orange-500" />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingDonations}
                  </p>

                  <p className="font-semibold text-gray-900">
                    {t("Pending")}
                  </p>

                  <p className="mt-1 text-xs text-orange-500">
                    {t("Awaiting pickup")}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("Cancelled")}
              className={`w-full rounded-2xl border bg-white p-6 text-left shadow-sm transition ${
                selectedStatus === "Cancelled"
                  ? "border-red-500 ring-2 ring-red-100"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
                  <XCircle size={28} className="text-red-500" />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {cancelledDonations}
                  </p>

                  <p className="font-semibold text-gray-900">
                    {t("Cancelled")}
                  </p>

                  <p className="mt-1 text-xs text-red-500">
                    {t("Donations cancelled")}
                  </p>
                </div>
              </div>
            </button>
          </section>

          {/* DONATIONS TABLE */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* SEARCH AND REFRESH */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-5">
              <div className="relative w-full max-w-[360px]">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder={t("Search donations...")}
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>

              <button
                type="button"
                onClick={fetchDonations}
                disabled={loading}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={16} />
                {t("Refresh")}
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {loadError && (
              <div className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                <p>{loadError}</p>

                <button
                  type="button"
                  onClick={fetchDonations}
                  className="mt-2 font-semibold underline"
                >
                  {t("Try again")}
                </button>
              </div>
            )}

            {/* TABLE HEADER */}
            <div className="grid grid-cols-[minmax(200px,2.3fr)_minmax(75px,1fr)_minmax(100px,1fr)_minmax(115px,1.2fr)_120px] border-b border-gray-200 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-700">
              <div>{t("Food Item")}</div>
              <div>{t("Quantity")}</div>
              <div>{t("Status")}</div>
              <div>{t("Created Date")}</div>
              <div>{t("Actions")}</div>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="p-12 text-center text-gray-600">
                {t("Loading your donations...")}
              </div>
            )}

            {/* DONATION ROWS */}
            {!loading &&
              !loadError &&
              filteredDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="grid grid-cols-[minmax(200px,2.3fr)_minmax(75px,1fr)_minmax(100px,1fr)_minmax(115px,1.2fr)_120px] items-center border-b border-gray-100 px-5 py-5 transition hover:bg-gray-50"
                >
                  {/* FOOD ITEM */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50">
                      {donation.image ? (
                        <img
                          src={
                            donation.image.startsWith("http")
                              ? donation.image
                              : `${API_URL.replace(
                                  "/api",
                                  ""
                                )}/${donation.image.replace(/^\/+/, "")}`
                          }
                          alt={donation.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Package
                          size={26}
                          className="text-green-700"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-gray-900">
                        {donation.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} className="shrink-0" />

                        <span className="break-words">
                          {donation.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {donation.quantity}
                    </p>

                    <p className="text-xs text-gray-500">
                      {donation.unit}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div>{renderStatus(donation.status)}</div>

                  {/* DATE */}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {donation.date}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {donation.time}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleView(donation)}
                      className="rounded-lg border border-green-500 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                    >
                      {t("View")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteDonation(donation)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                      title={t("Delete donation")}
                      aria-label={`${t("Delete")} ${donation.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

            {/* EMPTY STATE */}
            {!loading &&
              !loadError &&
              filteredDonations.length === 0 && (
                <div className="py-16 text-center">
                  <Package
                    size={45}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="mt-4 text-lg font-semibold text-gray-700">
                    {donations.length === 0
                      ? t("No donations yet")
                      : t("No donations found")}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {donations.length === 0
                      ? t(
                          "Submit a food donation to see it listed here."
                        )
                      : t(
                          "Try changing your search or status filter."
                        )}
                  </p>

                  {donations.length === 0 && (
                    <Link
                      to="/donate-food"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                    >
                      <Plus size={18} />
                      {t("Donate Food")}
                    </Link>
                  )}
                </div>
              )}
          </section>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteDonation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-donation-title"
            className="w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Trash2 size={28} className="text-red-500" />
            </div>

            <h2
              id="delete-donation-title"
              className="mt-5 text-center text-xl font-bold text-gray-900"
            >
              {t("Delete Donation?")}
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              {t("Are you sure you want to delete")}{" "}
              <span className="font-semibold text-gray-700">
                {deleteDonation.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-center text-xs text-red-500">
              {t(
                "This action cannot be undone if the server permanently deletes it."
              )}
            </p>

            <div className="mt-6 flex w-full items-center justify-center gap-5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteDonation(null)}
                className="flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {t("Cancel")}
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-500 p-3 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? t("Deleting...") : t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

