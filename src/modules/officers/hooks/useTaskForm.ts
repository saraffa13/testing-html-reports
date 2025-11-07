// File: src/modules/officers/hooks/useTaskForm.ts
import { useEffect, useState } from "react";
import { taskService, type CreateTaskResponse, type TaskFormData } from "../service/taskService";

export const useTaskForm = (areaOfficerId: string | null) => {
  const [formData, setFormData] = useState<TaskFormData>({
    taskLocation: {
      selectedSites: [],
      customLocation: undefined,
      isCustomLocation: false,
    },
    taskSelection: {
      selectedTasks: [],
    },
    taskDeadline: {
      dueDate: "",
      dueTime: "",
      amPm: "AM",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = () => {
    try {
      const draft = taskService.loadDraft();
      if (draft) {
        setFormData(draft);
        console.log("📥 Loaded draft from storage");
      }
    } catch (err) {
      console.error("❌ Error loading draft:", err);
    }
  };

  const updateFormData = (section: keyof TaskFormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const saveDraft = async (): Promise<boolean> => {
    try {
      const success = await taskService.saveDraft(formData);
      if (success) {
        console.log("✅ Draft saved successfully");
      }
      return success;
    } catch (err) {
      console.error("❌ Error saving draft:", err);
      setError("Failed to save draft");
      return false;
    }
  };

  const submitTask = async (): Promise<CreateTaskResponse | null> => {
    if (!areaOfficerId) {
      setError("Area Officer ID is required");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Submitting task for officer:", areaOfficerId);

      const result = await taskService.createTask(formData, areaOfficerId);

      // Clear draft after successful creation
      taskService.clearDraft();

      console.log("✅ Task submitted successfully:", result);
      return result;
    } catch (err: any) {
      console.error("❌ Task submission error:", err);
      setError(err.message || "Failed to create task");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Validate location selection
        if (formData.taskLocation.isCustomLocation) {
          return !!formData.taskLocation.customLocation?.trim();
        } else {
          return formData.taskLocation.selectedSites.length > 0;
        }
      case 2:
        return formData.taskSelection.selectedTasks.length > 0;
      case 3:
        return !!formData.taskDeadline.dueDate && !!formData.taskDeadline.dueTime && !!formData.taskDeadline.amPm;
      default:
        return true;
    }
  };

  const validateForm = (): string[] => {
    return taskService.validateFormData(formData);
  };

  const clearForm = () => {
    setFormData({
      taskLocation: {
        selectedSites: [],
        customLocation: undefined,
        isCustomLocation: false,
      },
      taskSelection: {
        selectedTasks: [],
      },
      taskDeadline: {
        dueDate: "",
        dueTime: "",
        amPm: "AM",
      },
    });
    taskService.clearDraft();
    setError(null);
  };

  const clearDraft = () => {
    taskService.clearDraft();
  };

  const getTaskTypeDisplayName = (taskType: string): string => {
    return taskService.getTaskTypeDisplayName(taskType);
  };

  const formatDeadlineForDisplay = (dueDate: string, dueTime: string, amPm: "AM" | "PM"): string => {
    return taskService.formatDeadlineForDisplay(dueDate, dueTime, amPm);
  };

  return {
    formData,
    loading,
    error,
    updateFormData,
    saveDraft,
    submitTask,
    validateStep,
    validateForm,
    clearForm,
    clearDraft,
    loadDraft,
    getTaskTypeDisplayName,
    formatDeadlineForDisplay,
  };
};
