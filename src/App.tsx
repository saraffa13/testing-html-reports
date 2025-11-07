import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./Layout";

// Guard Module
import { ThemeProvider } from "@emotion/react";
import { GuardProvider } from "./modules/guards/context/GuardContext";

//officer module
import { OfficerProvider } from "./modules/officers/context/OfficerContext";

// Settings Module
import { ClientContextProvider } from "@modules/clients/context/ClientContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "./modules/settings/context/SettingsContext";
import theme from "./theme";

// Lazy loaded components
const Clients = lazy(() => import("./modules/clients/pages/Clients"));
const LoginPage = lazy(() => import("./modules/LoginPage"));
const GuardPerformancePage = lazy(() => import("./modules/guards/components/GuardPerformancePage"));
const AddNewGuard = lazy(() => import("./modules/guards/pages/AddNewGuards"));
const ContentWindow = lazy(() => import("./modules/guards/pages/GuardContentWindow"));
const IncidentDetailsPage = lazy(() => import("@modules/officers/components/OfficerInsights/OfficerPerformanceWindow-SubComponents/IncidentDetailsPage"));
const AddClients = lazy(() => import("./modules/clients/pages/AddClients"));
const AddClientSite = lazy(() => import("./modules/clients/pages/AddClientSite"));
const AddClientUniform = lazy(() => import("./modules/clients/pages/AddClientUniform"));
const ClientGuards = lazy(() => import("./modules/clients/pages/ClientGuards"));
const AreaOfficersTasksDetails = lazy(() => import("./modules/clients/pages/performance/AreaOfficersTasksDetails"));
const AreaOfficersTasks = lazy(() => import("./modules/clients/pages/performance/AreaOfficerTasks"));
const ClientGuardDefaults = lazy(() => import("./modules/clients/pages/performance/ClientGuardDefaults"));
const ClientGuardDefaultsDetails = lazy(() => import("./modules/clients/pages/performance/ClientGuardDefaultsDetails"));
const ClientLayout = lazy(() => import("./modules/clients/pages/performance/ClientLayout"));
const ClientPerformance = lazy(() => import("./modules/clients/pages/performance/ClientPerformance"));
const GuardsTasks = lazy(() => import("./modules/clients/pages/performance/GuardsTasks"));
const IncidentReports = lazy(() => import("./modules/clients/pages/performance/IncidentReports"));
const OfficerContentWindow = lazy(() => import("./modules/officers/pages/OfficerContentWindow"));
const ClientAreaOfficers = lazy(() => import("@modules/clients/pages/ClientAreaOfficers"));
const ClientSites = lazy(() => import("@modules/clients/pages/ClientSites"));
const Profile = lazy(() => import("@modules/clients/pages/Profile"));
const Sites = lazy(() => import("@modules/clients/pages/sites/Sites"));
const LiveDashboard = lazy(() => import("@modules/dashboard/pages/LiveDashboard"));
const TaskDetailsPage = lazy(() => import("@modules/officers/components/OfficerInsights/OfficerPerformanceWindow-SubComponents/TaskDetailsPage"));
const OfficerPerformancePage = lazy(() => import("@modules/officers/components/OfficerPerformancePage"));
const AddNewOfficer = lazy(() => import("@modules/officers/pages/AddNewOfficer"));
const DashboardIncidentDetailsPage = lazy(() => import("./modules/dashboard/components/DashboardIncidentDetailsPage"));
const DashboardTaskDetailsPage = lazy(() => import("./modules/dashboard/components/DashboardTaskDetailsPage"));
const AddTaskFlow = lazy(() => import("./modules/officers/pages/AddTaskFlow"));
const AddNewUniform = lazy(() => import("./modules/settings/components/AddNewUniform"));
const SettingsPage = lazy(() => import("./modules/settings/pages/SettingsPage"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
    },
    mutations: {
      retry: 0, // Retry failed mutations once
    },
  },
});

function App() {
  return (
    <main className="font-mukta">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GuardProvider>
            <OfficerProvider>
              <SettingsProvider>
                <BrowserRouter>
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  }>
                    <Routes>
                      {/* Route WITHOUT Layout - Public Routes */}
                      <Route path="/login" element={<LoginPage />} />

                      {/* Routes WITH Layout - Protected Routes */}
                      <Route
                        element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }
                      >
                      <Route path="/" element={<LiveDashboard />} />
                      <Route path="/dashboard/tasks/:taskId/details" element={<DashboardTaskDetailsPage />} />
                      <Route
                        path="/dashboard/incidents/:incidentId/details"
                        element={<DashboardIncidentDetailsPage />}
                      />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/add-client" element={<AddClients />} />
                      <Route element={<ClientContextProvider />}>
                        <Route path="/clients/:clientId/add-client-uniform" element={<AddClientUniform />} />
                        <Route path="/clients/:clientId/add-client-site" element={<AddClientSite />} />
                        <Route element={<ClientLayout />}>
                          <Route path="/clients/:clientId/performance" element={<ClientPerformance />} />
                          <Route
                            path="/clients/:clientId/performance/guards-defaults"
                            element={<ClientGuardDefaults />}
                          />
                          <Route path="/clients/:clientId/performance/incident-reports" element={<IncidentReports />} />
                          <Route
                            path="/clients/:clientId/performance/area-officers-tasks"
                            element={<AreaOfficersTasks />}
                          />
                          <Route path="/clients/:clientId/performance/guards-tasks" element={<GuardsTasks />} />
                          <Route path="/clients/:clientId/guards" element={<ClientGuards />} />
                          <Route path="/clients/:clientId/area-officers" element={<ClientAreaOfficers />} />
                          <Route path="/clients/:clientId/sites" element={<ClientSites />} />
                          <Route path="/clients/:clientId/sites/:siteId" element={<Sites />} />
                          <Route path="/clients/:clientId/profile" element={<Profile />} />
                        </Route>
                        <Route
                          path="/clients/:clientId/performance/area-officers-tasks/:siteId"
                          element={<AreaOfficersTasksDetails />}
                        />
                        <Route
                          path="/clients/:clientId/performance/guards-defaults/:siteId"
                          element={<ClientGuardDefaultsDetails />}
                        />
                      </Route>
                      <Route
                        path="/clients/:clientId/performance/area-officers-tasks/:siteId"
                        element={<AreaOfficersTasksDetails />}
                      />
                      <Route
                        path="/clients/:clientId/performance/guards-defaults/:siteId"
                        element={<ClientGuardDefaultsDetails />}
                      />

                      {/* Guards Module */}
                      <Route path="/dashboard" element={<LiveDashboard />} />

                      <Route path="/guards" element={<ContentWindow />} />
                      <Route path="/guards/:guardId/performance" element={<GuardPerformancePage />} />
                      <Route path="/guards/:guardId" element={<GuardPerformancePage />} />
                      <Route path="/add-guard" element={<AddNewGuard />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/add-new-uniform" element={<AddNewUniform />} />
                      <Route path="/officers" element={<OfficerContentWindow />} />
                      <Route path="/officers/:officerId/performance" element={<OfficerPerformancePage />} />
                      <Route path="/officers/:officerId" element={<OfficerPerformancePage />} />
                      <Route path="/incidents/:incidentId/details" element={<IncidentDetailsPage />} />
                      <Route path="/tasks/:taskId/details" element={<TaskDetailsPage />} />
                      <Route path="/add-officer" element={<AddNewOfficer />} />
                      <Route path="/officers/:officerId/add-task" element={<AddTaskFlow />} />
                    </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </SettingsProvider>
            </OfficerProvider>
          </GuardProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </main>
  );
}

export default App;
