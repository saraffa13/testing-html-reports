import { ProgressStepper, type Step } from "@components/ProgressStepper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreateClient } from "../apis/hooks/useCreateClient";
import AddClientSuccess from "../components/forms/add_client/AddClientSuccess";
import ClientInfoForm from "../components/forms/add_client/ClientInfoForm";
import ContactDetailsForm from "../components/forms/add_client/ContactDetailsForm";
import { DraftModal } from "../components/modals/DraftModal";
import type { ClientFormData } from "../types";

const progressSteps: Step[] = [
  { id: 1, label: "CLIENT INFORMATION" },
  { id: 2, label: "CONTACT DETAILS" },
];

export default function AddClients() {
  const [currentStep, setCurrentStep] = useState(1);
  const [clientLogo, setClientLogo] = useState<File | null>(null);
  const [disabledSteps, setDisabledSteps] = useState<number[]>([]);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const agencyId = user.agencyId || "";
  const navigate = useNavigate();
  const createClientMutation = useCreateClient(() => {
    console.log("Client created successfully:");
    localStorage.removeItem("clientDraft");
    setCurrentStep(3);
  });
  const responseData = createClientMutation.data;
  const clientId = responseData?.data?.id || "";
  useEffect(() => {
    console.log("Response data:", responseData);
    console.log("Client ID:", clientId);
  }, [responseData]);
  const methods = useForm<ClientFormData>({
    mode: "onChange",
    defaultValues: {
      clientName: "",
      address: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        district: "",
        pincode: "",
        state: "",
        landmark: "",
      },
      contactDetails: {
        contactPerson: {
          fullName: "",
          designation: "",
          phoneNumber: "",
          email: "",
        },
        emergencyContact: {
          fullName: "",
          designation: "",
          phoneNumber: "",
          email: "",
        },
      },
    },
  });
  const { handleSubmit, trigger, watch, reset } = methods;

  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem("clientDraft");
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setDraftData(parsedDraft);
          setDraftModalOpen(true);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        localStorage.removeItem("clientDraft");
      }
    };

    loadDraft();
  }, [reset]);

  const handleContinueDraft = () => {
    try {
      if (draftData) {
        const { clientLogo: logoData, ...restData } = draftData;
        reset(restData);
        setCurrentStep(draftData.currentStep || 1);

        if (logoData) {
          console.log("Draft had logo info:", logoData.name);
          setClientLogo(null);
        }
      }
      setDraftModalOpen(false);
      setDraftData(null);
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("clientDraft");
    setDraftModalOpen(false);
    setDraftData(null);
  };

  useEffect(() => {
    const logo = watch("clientLogo");
    console.log("Logo changed:", logo);
  });
  const nextStep = async () => {
    const step1Fields = [
      "clientName",
      "clientLogo",
      "address.addressLine1",
      "address.city",
      "address.district",
      "address.pincode",
      "address.state",
    ];
    const fieldsToValidate = currentStep === 1 ? step1Fields : [];
    const isStepValid = await trigger(fieldsToValidate as any);

    // Additional check for clientLogo since it's a File object
    const hasLogo = clientLogo !== null;

    let valid = isStepValid && (currentStep !== 1 || hasLogo);
    const newDisabledSteps: number[] = [];

    if (!valid) {
      newDisabledSteps.push(currentStep + 1);
    }

    setDisabledSteps(newDisabledSteps);

    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: ClientFormData) => {
    console.log("Form submitted:", data);

    const formData = new FormData();

    formData.append("opAgencyId", agencyId);
    formData.append("clientName", data.clientName);
    formData.append("clientLogo", clientLogo!);
    formData.append("addressLine1", data.address.addressLine1);
    formData.append("city", data.address.city);
    formData.append("district", data.address.district);
    formData.append("pinCode", data.address.pincode);
    formData.append("state", data.address.state);
    formData.append("contactPersonFullName", data.contactDetails.contactPerson.fullName);
    formData.append("designation", data.contactDetails.contactPerson.designation);
    formData.append("contactPhone", data.contactDetails.contactPerson.phoneNumber);
    formData.append("contactEmail", data.contactDetails.contactPerson.email);

    if (data.contactDetails.emergencyContact?.fullName) {
      formData.append("emergencyContactName", data.contactDetails.emergencyContact.fullName);
    }
    if (data.contactDetails.emergencyContact?.designation) {
      formData.append("emergencyContactDesignation", data.contactDetails.emergencyContact.designation);
    }
    if (data.contactDetails.emergencyContact?.phoneNumber) {
      formData.append("emergencyContactPhone", data.contactDetails.emergencyContact.phoneNumber);
    }
    if (data.contactDetails.emergencyContact?.email) {
      formData.append("emergencyContactEmail", data.contactDetails.emergencyContact.email);
    }

    if (data.address.addressLine2) {
      formData.append("addressLine2", data.address.addressLine2);
    }
    if (data.address.landmark) {
      formData.append("landMark", data.address.landmark);
    }

    createClientMutation.mutate(formData);
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      window.location.href = "/clients";
    }
  };

  const handleSaveDraft = async () => {
    try {
      const formData = methods.getValues();
      const draftData = {
        ...formData,
        clientLogo: clientLogo
          ? {
              name: clientLogo.name,
              size: clientLogo.size,
              type: clientLogo.type,
            }
          : null,
        currentStep,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem("clientDraft", JSON.stringify(draftData));
      alert("Draft saved successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  const handleLogoChange = (file: File | null) => {
    setClientLogo(file);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center text-xl gap-2 font-semibold mb-2">
          <ArrowBackIcon onClick={() => navigate(-1)} className="cursor-pointer" />
          <h2 className="">Add New Clients</h2>
        </div>

        {currentStep < 3 && (
          <div className="flex flex-row gap-4">
            <Button variant="contained" color="error" onClick={handleDiscard}>
              <DeleteOutlineOutlinedIcon
                sx={{
                  typography: {
                    fontSize: "14px",
                  },
                }}
              />
              <Typography
                sx={{
                  typography: {
                    fontSize: "14px",
                  },
                }}
              >
                DISCARD
              </Typography>
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveDraft}>
              <DraftsOutlinedIcon
                sx={{
                  typography: {
                    fontSize: "14px",
                  },
                }}
              />
              <Typography
                sx={{
                  typography: {
                    fontSize: "14px",
                  },
                }}
              >
                SAVE DRAFT
              </Typography>
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit(onSubmit)}
              disabled={createClientMutation.isPending}
            >
              <CheckOutlinedIcon
                sx={{
                  typography: {
                    fontSize: "14px",
                  },
                }}
              />
              <Typography
                sx={{
                  typography: {
                    fontSize: "14px",
                  },
                }}
              >
                {createClientMutation.isPending ? "SUBMITTING..." : "SUBMIT FORM"}
              </Typography>
            </Button>
          </div>
        )}
      </div>

      <div
        id="container"
        className={`bg-[#F1F7FE] mt-2 rounded-xl p-4 flex flex-col ${currentStep === 3 ? "h-[calc(100%-55px)]" : ""}`}
      >
        {currentStep <= 3 && (
          <ProgressStepper
            currentStep={currentStep}
            steps={progressSteps}
            onStepClick={handleStepClick}
            disabledSteps={disabledSteps}
          />
        )}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={`flex-1 flex flex-col ${currentStep === 3 ? "h-full" : ""}`}
          >
            {currentStep === 1 && (
              <ClientInfoForm clientLogo={clientLogo} setClientLogo={setClientLogo} onLogoChange={handleLogoChange} />
            )}

            {currentStep === 2 && <ContactDetailsForm />}

            {currentStep === 3 && <AddClientSuccess clientId={clientId} />}

            {currentStep < 3 && (
              <div className="flex flex-row mt-4 w-full justify-end gap-4">
                {currentStep > 1 && (
                  <Button variant="outlined" onClick={prevStep}>
                    Previous
                  </Button>
                )}

                {currentStep < 2 && (
                  <Button variant="contained" onClick={nextStep}>
                    Next
                  </Button>
                )}

                {currentStep === 2 && (
                  <Button variant="contained" color="success" type="submit" disabled={createClientMutation.isPending}>
                    {createClientMutation.isPending ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            )}
          </form>
        </FormProvider>
      </div>

      <DraftModal
        open={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        onContinue={handleContinueDraft}
        onDiscard={handleDiscardDraft}
        savedAt={draftData?.savedAt || ""}
      />
    </div>
  );
}
