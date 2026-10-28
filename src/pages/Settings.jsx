
import React from "react";
import {
  Bell,
  Mail,
  Moon,
  Sun,
  Languages,
  ShieldCheck,
  Settings as SettingsIcon,
  CheckCircle,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Settings() {
  const { settings, updateSetting, t } = useSettings();
  const dark = settings.darkMode;

  const card = `rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${
    dark
      ? "border-gray-700 bg-gray-800 text-gray-100"
      : "border-gray-100 bg-white text-gray-800"
  }`;

  const description = dark ? "text-gray-400" : "text-gray-500";

  function Toggle({ checked, onChange, label }) {
    return (
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
          checked
            ? "bg-emerald-600"
            : dark
              ? "bg-gray-600"
              : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  function SettingRow({
    icon: Icon,
    title,
    descriptionText,
    children,
    last = false,
  }) {
    return (
      <div
        className={`flex items-center justify-between gap-4 py-5 ${
          last
            ? ""
            : `border-b ${
                dark ? "border-gray-700" : "border-gray-100"
              }`
        }`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-1 rounded-xl p-3 ${
              dark
                ? "bg-emerald-950 text-emerald-400"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <Icon size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className={`mt-1 text-sm ${description}`}>
              {descriptionText}
            </p>
          </div>
        </div>

        <div className="shrink-0">{children}</div>
      </div>
    );
  }

  const appearanceTitle = dark
    ? t("Light Mode")
    : t("Dark Mode");

  const appearanceDescription = dark
    ? t("Light Mode Description")
    : t("Dark Mode Description");

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-300 sm:p-8 ${
        dark
          ? "bg-gray-900 text-gray-100"
          : "bg-[#f4f7f5] text-gray-800"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-800 p-3 text-white">
            <SettingsIcon size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t("Settings")}
            </h1>
            <p className={`mt-1 text-sm ${description}`}>
              {t("Settings")} · FoodShare
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className={card}>
            <h2 className="text-lg font-bold">
              {t("Appearance")}
            </h2>

            <SettingRow
              icon={dark ? Sun : Moon}
              title={appearanceTitle}
              descriptionText={appearanceDescription}
              last
            >
              <Toggle
                label={appearanceTitle}
                checked={settings.darkMode}
                onChange={(value) =>
                  updateSetting("darkMode", value)
                }
              />
            </SettingRow>
          </section>

          {/* Notifications */}
          <section className={card}>
            <h2 className="text-lg font-bold">
              {t("Notifications")}
            </h2>

            <SettingRow
              icon={Bell}
              title={t("Notifications")}
              descriptionText={t("Notifications Description")}
            >
              <Toggle
                label={t("Notifications")}
                checked={settings.notifications}
                onChange={(value) =>
                  updateSetting("notifications", value)
                }
              />
            </SettingRow>

            <SettingRow
              icon={Mail}
              title={t("Email Notifications")}
              descriptionText={t("Email Description")}
              last
            >
              <Toggle
                label={t("Email Notifications")}
                checked={settings.emailNotifications}
                onChange={(value) =>
                  updateSetting("emailNotifications", value)
                }
              />
            </SettingRow>
          </section>

          {/* Language */}
          <section className={card}>
            <SettingRow
              icon={Languages}
              title={t("Language")}
              descriptionText={t("Language Description")}
              last
            >
              <select
                aria-label={t("Language")}
                value={settings.language}
                onChange={(event) =>
                  updateSetting("language", event.target.value)
                }
                className={`rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                  dark
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                <option value="English">English</option>
                <option value="Tamil">தமிழ்</option>
              </select>
            </SettingRow>
          </section>

          {/* Privacy and Security */}
          <section className={card}>
            <SettingRow
              icon={ShieldCheck}
              title={t("Privacy & Security")}
              descriptionText={t("Privacy Description")}
              last
            >
              <CheckCircle
                className="text-emerald-500"
                size={24}
              />
            </SettingRow>
          </section>

          {/* Saved Preferences */}
          <div
            className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
              dark
                ? "border-emerald-900 bg-emerald-950 text-emerald-300"
                : "border-emerald-100 bg-emerald-50 text-emerald-800"
            }`}
          >
            <CheckCircle size={20} />
            <p>{t("Saved Message")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

