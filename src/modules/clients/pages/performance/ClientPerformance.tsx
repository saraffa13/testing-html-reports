import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ClientPerformance() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/clients/${clientId}/performance/guards-defaults`, { replace: true });
  }, []);
  return <div>ClientPerformance</div>;
}
