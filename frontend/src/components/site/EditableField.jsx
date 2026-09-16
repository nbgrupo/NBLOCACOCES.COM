import React from "react";
import { useEditMode } from "@/context/EditModeContext";

/**
 * Wraps any editable content.
 * In edit mode: shows a dashed highlight and opens the inline editor on click.
 * Outside edit mode: renders children unchanged.
 *
 * Props:
 *   path  — dot-path in config, e.g. "hero.subtitle"
 *   type  — "text" | "textarea" | "image" | "number"  (default: "text")
 *   as    — HTML tag to render wrapper as (default: "span")
 *   className — extra classes on the wrapper (edit mode only)
 */
export default function EditableField({
  path,
  type = "text",
  as: Tag = "span",
  className = "",
  children,
}) {
  const { isEditMode, openPopover } = useEditMode();

  if (!isEditMode) return <>{children}</>;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    openPopover(path, type, rect);
  };

  return (
    <Tag
      data-nb-editable
      data-nb-type={type}
      onClick={handleClick}
      title="Clique para editar"
      className={`nb-editable ${className}`}
    >
      {children}
    </Tag>
  );
}
