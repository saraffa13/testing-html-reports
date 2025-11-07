import { useState } from "react";

interface CustomSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  labelOff?: string;
  labelOn?: string;
}

export const CustomSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  labelOff = "Off",
  labelOn = "On",
}: CustomSwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <div className="flex items-center select-none whitespace-nowrap">
      {/* Off Label */}
      <span
        className={`
          text-base font-medium px-3 py-1
          ${isChecked ? "text-gray-700" : "text-white bg-[#2A77D5] rounded-l-full"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {labelOff}
      </span>

      {/* Switch Container */}
      <div
        className={`
          relative inline-flex items-center h-8 px-2 bg-[#2A77D5] whitespace-nowrap
          ${isChecked ? "rounded-l-full" : "rounded-r-full"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative inline-flex items-center h-5 w-8 rounded-full 
            bg-white shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
            ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
          `}
          role="switch"
          aria-checked={isChecked}
          aria-label={`Toggle switch ${isChecked ? "on" : "off"}`}
        >
          <span
            className={`
              h-3 w-3 bg-[#629DE4] inline-block rounded-full shadow-sm
              transform
              ${isChecked ? "translate-x-4" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {/* On Label */}
      <span
        className={`
          text-base font-medium px-3 py-1 whitespace-nowrap
          ${isChecked ? "text-white bg-[#2A77D5] rounded-r-full" : "text-gray-700"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {labelOn}
      </span>
    </div>
  );
};
