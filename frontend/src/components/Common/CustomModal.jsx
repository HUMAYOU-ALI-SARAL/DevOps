import React from "react";
import { RxCross2 } from "react-icons/rx";

const CustomModal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#353535] text-white rounded-lg p-5 relative w-[90%] max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-white hover:text-gray-400"
        >
          <RxCross2 size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default CustomModal;
