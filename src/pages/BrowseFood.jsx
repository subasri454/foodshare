
import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function BrowseFood() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("foodshare_token");

        const response = await fetch(`${API_URL}/donations`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load available donations."
          );
        }

        const donations = Array.isArray(data)
          ? data
          : data.donations || data.foods || data.data || [];

        const availableFoods = donations
          .filter(
            (item) =>
              String(item.status || "").toLowerCase() === "available"
          )
          .map((item) => {
            const foodName =
              item.food_name ||
              item.title ||
              item.name ||
              "Food Donation";

            const quantity = item.quantity
              ? `Quantity: ${item.quantity}`
              : "Quantity details not provided";

            return {
              ...item,
              id: item.id,
              title: foodName,
              description:
                item.description ||
                item.food_description ||
                "Food shared by a donor.",
              details: quantity,
              type:
                String(item.food_type || "").toLowerCase().includes("non") ||
                String(item.type || "").toLowerCase().includes("non")
                  ? "Non-Veg"
                  : "Veg",
            };
          });

        setFoods(availableFoods);
      } catch (err) {
        console.error("Browse Food Error:", err);
        setError(err.message || "Could not load food donations.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      category === "All" || food.type === category;

    const searchText = search.toLowerCase();

    const matchesSearch =
      String(food.title).toLowerCase().includes(searchText) ||
      String(food.description).toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  const handleViewFood = (food) => {
    navigate("/pickup-request", {
      state: { food },
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7f5]">
      {/* Fixed Header */}
      <header className="relative z-40 h-[100px] shrink-0 border-b border-gray-200 bg-[#f4f7f5] px-5 sm:px-8">
        <div className="flex h-full items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#063b2c] sm:text-3xl">
              Available Food
            </h1>
            <p className="mt-1 text-base text-gray-500 sm:text-[18px]">
              Find food shared by donors
            </p>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main
        className="min-h-0 w-full flex-1 overflow-y-auto overscroll-y-contain bg-[#f4f7f5] px-4 pb-8 sm:px-8"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="px-2 py-6 sm:px-7">
          {/* Search */}
          <div className="mb-6 flex w-full items-center gap-3 sm:gap-4">
            <div className="flex h-[56px] min-w-0 flex-1 items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm sm:px-4">
              <Search
                size={21}
                className="mr-3 shrink-0 text-gray-400 sm:mr-4"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food..."
                className="w-full min-w-0 bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              aria-label="Reset food filters"
              onClick={() => {
                setCategory("All");
                setSearch("");
              }}
              className="flex h-[56px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 sm:w-[58px]"
            >
              <SlidersHorizontal size={21} className="text-gray-800" />
            </button>
          </div>

          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap gap-3">
            {["All", "Veg", "Non-Veg"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-6 py-2.5 text-[15px] font-semibold transition ${
                  category === item
                    ? "border-[#16a34a] bg-[#16a34a] text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-bold text-[#071a2d]">
            {loading
              ? "Loading donations..."
              : `${filteredFoods.length} available donations`}
          </h2>

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-600">
              Loading food donated by users...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="font-semibold text-red-600">
                Could not load donations
              </p>
              <p className="mt-2 text-gray-600">{error}</p>
              <p className="mt-2 text-sm text-gray-500">
                Check that your backend is running and the available-donations
                API has been added.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-[#16a34a] px-5 py-2.5 font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No available food donations yet.
              </p>
              <p className="mt-2 text-gray-500">
                Food will appear here when donors submit available donations.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-5">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="mb-2 break-words text-[22px] font-bold text-[#071a2d]">
                    {food.title}
                  </h3>

                  <p className="mb-6 break-words text-base text-[#36506b]">
                    {food.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-base text-[#36506b]">
                      {food.details}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleViewFood(food)}
                      className="rounded-xl bg-[#16a34a] px-7 py-3 font-semibold text-white transition hover:bg-[#12863d]"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
