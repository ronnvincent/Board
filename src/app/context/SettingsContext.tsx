import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export interface SystemSettings {
  id?: string;
  platform_name: string;
  support_email: string;
  allow_registration: boolean;
  maintenance_mode: boolean;
  dark_mode_default: boolean;
  theme_color: string;
  curfew_enabled: boolean;
  curfew_start: string;
  curfew_end: string;
  allow_visitors: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export const DEFAULT_THEME_COLOR = "#1f5149";

const defaultSettings: SystemSettings = {
  platform_name: "BoardingHow",
  support_email: "support@boardinghow.com",
  allow_registration: true,
  maintenance_mode: false,
  dark_mode_default: false,
  theme_color: DEFAULT_THEME_COLOR,
  curfew_enabled: false,
  curfew_start: "22:00",
  curfew_end: "05:00",
  allow_visitors: true,
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
};

export const SETTINGS_STORAGE_KEY = "board_admin_settings";
export const SETTINGS_UPDATED_EVENT = "board-settings-updated";

const normalizeSettings = (value?: Partial<SystemSettings> | null): SystemSettings => {
  const normalized = value ?? {};
  return {
    ...defaultSettings,
    ...normalized,
    platform_name: normalized.platform_name ?? (normalized as any).platformName ?? defaultSettings.platform_name,
    support_email: normalized.support_email ?? (normalized as any).supportEmail ?? defaultSettings.support_email,
    allow_registration:
      typeof (normalized as any).allow_registration === "boolean"
        ? (normalized as any).allow_registration
        : typeof (normalized as any).allowRegistration === "boolean"
          ? (normalized as any).allowRegistration
          : defaultSettings.allow_registration,
    maintenance_mode:
      typeof (normalized as any).maintenance_mode === "boolean"
        ? (normalized as any).maintenance_mode
        : typeof (normalized as any).maintenanceMode === "boolean"
          ? (normalized as any).maintenanceMode
          : defaultSettings.maintenance_mode,
    dark_mode_default:
      typeof (normalized as any).dark_mode_default === "boolean"
        ? (normalized as any).dark_mode_default
        : typeof (normalized as any).darkModeDefault === "boolean"
          ? (normalized as any).darkModeDefault
          : defaultSettings.dark_mode_default,
    theme_color: normalized.theme_color ?? (normalized as any).themeColor ?? defaultSettings.theme_color,
    curfew_enabled:
      typeof (normalized as any).curfew_enabled === "boolean"
        ? (normalized as any).curfew_enabled
        : typeof (normalized as any).curfewEnabled === "boolean"
          ? (normalized as any).curfewEnabled
          : defaultSettings.curfew_enabled,
    curfew_start: normalized.curfew_start ?? (normalized as any).curfewStart ?? defaultSettings.curfew_start,
    curfew_end: normalized.curfew_end ?? (normalized as any).curfewEnd ?? defaultSettings.curfew_end,
    allow_visitors:
      typeof (normalized as any).allow_visitors === "boolean"
        ? (normalized as any).allow_visitors
        : typeof (normalized as any).allowVisitors === "boolean"
          ? (normalized as any).allowVisitors
          : defaultSettings.allow_visitors,
    quiet_hours_enabled:
      typeof (normalized as any).quiet_hours_enabled === "boolean"
        ? (normalized as any).quiet_hours_enabled
        : typeof (normalized as any).quietHoursEnabled === "boolean"
          ? (normalized as any).quietHoursEnabled
          : defaultSettings.quiet_hours_enabled,
    quiet_hours_start: normalized.quiet_hours_start ?? (normalized as any).quietHoursStart ?? defaultSettings.quiet_hours_start,
    quiet_hours_end: normalized.quiet_hours_end ?? (normalized as any).quietHoursEnd ?? defaultSettings.quiet_hours_end,
  };
};

export const readSettingsFromStorage = (): SystemSettings => {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) {
      return defaultSettings;
    }

    return normalizeSettings(JSON.parse(saved));
  } catch (error) {
    console.error("Unable to parse stored settings:", error);
    return defaultSettings;
  }
};

export const persistSettingsToStorage = (value?: Partial<SystemSettings> | null) => {
  const nextSettings = normalizeSettings(value);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: nextSettings }));
  }

  return nextSettings;
};

const SettingsContext = createContext<{ settings: SystemSettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => readSettingsFromStorage());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applySettings = (value?: Partial<SystemSettings> | null) => {
      if (!isMounted) return;
      setSettings(normalizeSettings(value));
    };

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from("system_settings").select("*").limit(1).maybeSingle();
        if (!isMounted) return;

        if (data) {
          applySettings(data);
        } else {
          applySettings(readSettingsFromStorage());
        }

        if (error && error.code !== "PGRST116" && error.code !== "42P01") {
          console.error("Error fetching system settings:", error);
        }
      } catch (error) {
        console.error("Unable to load system settings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const handleSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<SystemSettings>;
      applySettings(customEvent.detail ?? readSettingsFromStorage());
    };

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY) {
        applySettings(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };

    fetchSettings();

    const subscription = supabase
      .channel("system_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings" },
        (payload) => {
          if (payload.new) {
            applySettings(payload.new as SystemSettings);
          }
        }
      )
      .subscribe();

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated as EventListener);
    window.addEventListener("storage", handleStorageUpdate as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated as EventListener);
      window.removeEventListener("storage", handleStorageUpdate as EventListener);
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (settings.theme_color) {
      document.documentElement.style.setProperty("--primary", settings.theme_color);
    }
  }, [settings.theme_color]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
