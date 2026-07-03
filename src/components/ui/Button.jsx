import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  style = {},
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button ${variant}`}
      style={style}
    >
      {children}
    </button>
  );
}
