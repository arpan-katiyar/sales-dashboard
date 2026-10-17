import { createContext, useContext, useEffect, useState } from "react";
import AdminService from "@/services/AdminService";
import { useAuth } from "./AuthContext";

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const { auth, status } = useAuth();
  console.log("auth",auth)

  const fetchConfig = async () => {
    try {
      const response = await AdminService.getConfigurations();
      console.log("reponse",response.data)
      setConfig(response.data);
    } catch (error) {
      console.error("Failed to load config", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "checking") {
      return;
    }
    if (auth?.userId) {
      fetchConfig();
    } else {
      setConfig(null);
      setLoading(false);
    }
  }, [auth?.userId, status]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        refreshConfig: fetchConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);