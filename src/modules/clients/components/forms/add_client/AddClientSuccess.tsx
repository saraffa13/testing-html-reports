import { Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddClientSuccess({ clientId }: { clientId: string }) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentQuestion === 1) {
      setCurrentQuestion(2);
    } else {
      navigate("/clients");
    }
  };
  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        id="box"
        className="flex flex-col bg-white w-fit gap-2 rounded-xl px-20 pt-10 text-center text-[#707070] text-2xl shadow-md"
      >
        {currentQuestion === 1 && (
          <div className="flex flex-col items-center">
            <p>You have successfully added the client details.</p>
            <p>Do you want to add custom Uniforms?</p>
            <div className="flex flex-row gap-4 mt-6">
              <Button
                onClick={() => navigate(`/clients/${clientId}/add-client-uniform`)}
                variant="contained"
                color="primary"
              >
                YES
              </Button>
              <Button onClick={handleNext} variant="contained" color="primary">
                NO
              </Button>
              <Button onClick={handleNext} variant="contained" color="primary">
                DO IT LATER
              </Button>
            </div>
          </div>
        )}
        {currentQuestion === 2 && (
          <div className="flex flex-col items-center">
            <p>You have successfully added the client details.</p>
            <p>Do you want to add a client site?</p>
            <div className="flex flex-row gap-4 mt-6">
              <Button
                onClick={() => navigate(`/clients/${clientId}/add-client-site`)}
                variant="contained"
                color="primary"
              >
                YES
              </Button>
              <Button onClick={handleNext} variant="contained" color="primary">
                DO IT LATER
              </Button>
            </div>
          </div>
        )}
        <span className="my-5 text-[#A3A3A3] text-[0.8rem]">{currentQuestion}/2</span>
      </div>
    </div>
  );
}
