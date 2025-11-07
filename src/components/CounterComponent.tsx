import { useState } from "react";

export default function CounterComponent() {
  const [count, setCount] = useState(5);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return (
    <div className="flex items-center gap-2 p-8">
      <button
        onClick={decrement}
        type="button"
        className="w-6 h-6 flex items-center justify-center bg-[#F1F7FE] text-blue-500 text-xl font-bold rounded hover:bg-blue-50 transition-colors"
      >
        −
      </button>

      <div className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 text-gray-800 text-xl font-medium rounded">
        {count}
      </div>

      <button
        onClick={increment}
        type="button"
        className="w-6 h-6 flex items-center justify-center bg-[#F1F7FE] text-blue-500 text-xl font-bold rounded hover:bg-blue-50 transition-colors"
      >
        +
      </button>
    </div>
  );
}
