"use client";
import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "8px",
        marginBottom: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    />
  );
}
