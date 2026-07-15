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
}

const defaultSettings: SystemSettings = {
  platform_name: "BoardingHow",
  support_email: "support@boardinghow.com",
  allow_registration: true,
  maintenance_mode: false,
  dark_mode_default: false,
  theme_color: "#1f5149"
};

const SettingsContext = createContext<{ settings: SystemSettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchSettings = async () => {
      const { data, error } = await supabase.from("system_settings").select("*").limit(1).maybeSingle();
      if (data) {
        setSettings(data);
      } else if (error) {
        console.error("Error fetching system settings:", error);
      }
      setLoading(false);
    };

    fetchSettings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("system_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings" },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as SystemSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Apply theme color dynamically
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
