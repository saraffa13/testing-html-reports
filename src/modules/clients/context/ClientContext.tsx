import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useGetClientById } from "../apis/hooks/useGetClientById";
import type { ClientDetailsApiResponse } from "../apis/services/client";

export type ViewType = "day" | "week" | "month" | "custom";

interface ClientContextType {
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  clientDetails: ClientDetailsApiResponse["data"] | null;
  isLoadingClient: boolean;
  clientError: any;
  customStartDate?: Date;
  customEndDate?: Date;
  setCustomDateRange: (startDate: Date, endDate: Date) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClientContext must be used within ClientContextProvider");
  }
  return context;
};

export function ClientContextProvider() {
  const [selectedView, setSelectedView] = useState<ViewType>("day");
  const [selectedSite, setSelectedSite] = useState("ALL SITES");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<string>("absent");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const { clientId } = useParams();

  // Fetch client details using the clientId from params
  const { data: clientResponse, isLoading: isLoadingClient, error: clientError } = useGetClientById(clientId || "");

  const clientDetails = clientResponse?.data || null;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const setCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  return (
    <ClientContext.Provider
      value={{
        selectedView,
        setSelectedView,
        selectedSite,
        setSelectedSite,
        currentDate,
        setCurrentDate,
        selectedMetric,
        setSelectedMetric,
        clientDetails,
        isLoadingClient,
        clientError,
        customStartDate,
        customEndDate,
        setCustomDateRange,
      }}
    >
      <Outlet />
    </ClientContext.Provider>
  );
}
