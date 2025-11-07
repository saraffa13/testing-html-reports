import ClientSidebar from "@modules/clients/components/ClientSidebar";
import { Outlet } from "react-router-dom";

export default function ClientLayout() {
  return (
    <ClientSidebar>
      <div className="flex flex-row w-full h-full rounded-lg">
        <Outlet />
      </div>
    </ClientSidebar>
  );
}
