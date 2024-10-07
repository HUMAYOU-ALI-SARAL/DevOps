import React from "react";
import { Modal as FlowModal } from 'flowbite-react';

type Props = {
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    width?: string;
};

const Modal = ({ show, onClose, children, className, width = "w-full" }: Props) => {
    return (
        <>
            {show && (
                <div className="fixed inset-0 bg-trnasparent bg-opacity-50 backdrop-blur-sm z-40"></div>
            )}
            <FlowModal
                theme={{
                    content: {
                        base: `relative h-full ${width} md:h-auto`,
                        inner: "relative rounded-[40px]  flex flex-col"
                    }
                }}
                show={show}
                onClose={onClose}
                position="center"
            >
                <div className={`m-auto bg-sp-gray-850 ${className}`} style={{ boxShadow: "0px 0px 8px 4px rgba(255, 165, 0, 0.2)", borderRadius:'25px', border:"2px solid #FF7F2A" }}>
                    {children}
                </div>
            </FlowModal>
        </>
    );
};

export default Modal;
