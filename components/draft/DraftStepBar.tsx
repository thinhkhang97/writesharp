"use client";

import { BookText, BrainCircuit, Pencil } from "lucide-react";

interface DraftStepBarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function DraftStepBar({
  currentStep,
  onStepChange,
}: DraftStepBarProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div className="w-full">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
              ></div>
            </div>
            <div className="flex text-sm justify-between -mt-2">
              <div
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep >= 1 ? "text-blue-500" : "text-gray-500"
                }`}
                onClick={() => onStepChange(1)}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                    currentStep >= 1
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <BookText className="h-5 w-5" />
                </div>
                <span className="mt-1">Foundation</span>
              </div>
              <div
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep >= 2 ? "text-blue-500" : "text-gray-500"
                }`}
                onClick={() => onStepChange(2)}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                    currentStep >= 2
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <span className="mt-1">Ideas</span>
              </div>
              <div
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep >= 3 ? "text-blue-500" : "text-gray-500"
                }`}
                onClick={() => onStepChange(3)}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                    currentStep >= 3
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <Pencil className="h-5 w-5" />
                </div>
                <span className="mt-1">Write</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
