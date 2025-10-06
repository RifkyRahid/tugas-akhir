"use client";
import React from "react";

export function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <button onClick={onClose} style={closeBtnStyle}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: "10px" }}>{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ margin: 0 }}>{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "14px", color: "#555" }}>{children}</p>;
}

// --- inline style ---
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "6px",
  padding: "20px",
  width: "400px",
  position: "relative",
};

const closeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "8px",
  right: "8px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "16px",
};
