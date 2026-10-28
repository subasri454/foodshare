import { Link } from "react-router-dom";

import {
  Utensils,
  Users,
  Building2,
  Leaf,
  FilePlus2,
  Search,
  Truck,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

export default function DonorDashboard() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden bg-[#f4f7f5]">

      {/* ================= MAIN CONTENT ================= */}
      <main className="w-full min-h-screen">

        {/* ================= HEADER ================= */}
        <header className="h-[80px] bg-[#f4f7f5] flex items-center px-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, Suba Sri! 👋
          </h2>
        </header>

        {/* ================= DASHBOARD CONTENT ================= */}
        <div className="px-8 pt-8 pb-10">

          {/* ================= HERO ================= */}
          <section
            className="relative w-full rounded-[35px] overflow-hidden h-[380px] mb-10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 h-full flex flex-col justify-center px-14 text-white">

              <h1 className="text-5xl font-bold mb-5">
                Share Food,
                <br />
                Share Love 💚
              </h1>

              <p className="text-lg max-w-xl mb-8">
                Connecting surplus food with people who need it.
                Together, we can reduce food waste and fight hunger.
              </p>

              <div className="flex gap-5">

                <Link
                  to="/donate-food"
                  className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 hover:bg-green-100"
                >
                  <HeartHandshake size={20} />
                  Donate Food
                </Link>

              </div>

            </div>
          </section>

          {/* ================= STATISTICS ================= */}
          <section className="grid grid-cols-4 gap-4 mb-4">

            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                <Utensils size={30} className="text-green-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  2,400+
                </h2>

                <h3 className="text-sm font-semibold text-gray-900">
                  Meals Shared
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Total meals shared till now
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                <Users size={30} className="text-green-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  850+
                </h2>

                <h3 className="text-sm font-semibold text-gray-900">
                  Active Donors
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  People contributing food
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                <Building2 size={30} className="text-green-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  120+
                </h2>

                <h3 className="text-sm font-semibold text-gray-900">
                  NGOs Connected
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  NGO partners joined
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                <Leaf size={30} className="text-green-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  780 kg
                </h2>

                <h3 className="text-sm font-semibold text-gray-900">
                  Food Saved
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  This month
                </p>
              </div>
            </div>

          </section>

          {/* ================= HOW IT WORKS ================= */}
          <section className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-4">

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>

            <div className="grid grid-cols-3">

              {/* STEP 1 */}
              <div className="flex items-start gap-4 pr-8 border-r border-gray-200">

                <div className="w-16 h-16 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                  <FilePlus2 size={30} className="text-green-700" />
                </div>

                <div>

                  <div className="flex items-center gap-3 mb-2">

                    <span className="w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </span>

                    <h3 className="font-bold text-gray-900">
                      Post Surplus Food
                    </h3>

                  </div>

                  <p className="text-sm text-gray-600 leading-6">
                    Donors list available food
                    <br />
                    with details & photos.
                  </p>

                </div>

              </div>

              {/* STEP 2 */}
              <div className="flex items-start gap-4 px-8 border-r border-gray-200">

                <div className="w-16 h-16 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                  <Search size={32} className="text-green-700" />
                </div>

                <div>

                  <div className="flex items-center gap-3 mb-2">

                    <span className="w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold">
                      2
                    </span>

                    <h3 className="font-bold text-gray-900">
                      Receivers Request
                    </h3>

                  </div>

                  <p className="text-sm text-gray-600 leading-6">
                    NGOs & individuals browse
                    <br />
                    and send pickup requests.
                  </p>

                </div>

              </div>

              {/* STEP 3 */}
              <div className="flex items-start gap-4 pl-8">

                <div className="w-16 h-16 shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                  <Truck size={32} className="text-green-700" />
                </div>

                <div>

                  <div className="flex items-center gap-3 mb-2">

                    <span className="w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </span>

                    <h3 className="font-bold text-gray-900">
                      Pickup & Share
                    </h3>

                  </div>

                  <p className="text-sm text-gray-600 leading-6">
                    Coordinate pickup and
                    <br />
                    ensure food reaches
                    <br />
                    those in need.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ================= BOTTOM CTA ================= */}
          <section className="bg-green-50 border border-green-100 rounded-2xl px-7 py-5 flex items-center justify-between">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 flex items-center justify-center">
                <HeartHandshake
                  size={48}
                  className="text-green-700"
                />
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Ready to make a difference?
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Join hundreds of donors and NGOs reducing food waste every day.
                </p>

              </div>

            </div>

            <Link
              to="/donate-food"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-800 transition"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>

          </section>

        </div>

      </main>

    </div>
  );
}