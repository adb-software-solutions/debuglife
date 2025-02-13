"use client";

import React, {useState, useCallback, useMemo, useRef, useEffect} from "react";
import {createPortal} from "react-dom";

interface Tag {
    id: string;
    name: string;
}

interface MultiSelectDropdownProps {
    options: Tag[];
    selected: string[]; // Array of tag IDs.
    onChange: (selected: string[]) => void;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selected,
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOptionClick = (id: string) => {
        onChange([...selected, id]);
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((s) => s !== id));
    };

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "absolute",
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    const dropdown = isOpen && (
        <ul
            style={dropdownStyle}
            className="z-50 rounded-md border border-gray-300 bg-white text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
            {options
                .filter((opt) => !selected.includes(opt.id))
                .map((opt) => (
                    <li
                        key={opt.id}
                        onClick={() => {
                            handleOptionClick(opt.id);
                            setIsOpen(false);
                        }}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {opt.name}
                    </li>
                ))}
        </ul>
    );

    return (
            <div ref={containerRef} className="relative w-full">
                <div
                    className="flex w-full cursor-pointer flex-wrap items-center gap-1 mt-1 p-3 border rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 dark:bg-gray-800 dark:text-gray-300"
                    onClick={toggleDropdown}
                >
                    {selected.length === 0 && (
                        <span className="text-gray-400">Select Tags...</span>
                    )}
                    {selected.map((id) => {
                        const option = options.find((opt) => opt.id === id);
                        if (!option) return null;
                        return (
                            <span
                                key={id}
                                className="flex items-center rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-800"
                            >
                                {option.name}
                                <button
                                    onClick={(e) => handleRemove(id, e)}
                                    className="ml-1 text-sky-600 hover:text-sky-800 focus:outline-none"
                                >
                                    &times;
                                </button>
                            </span>
                        );
                    })}
                </div>
                {isOpen && createPortal(dropdown, document.body)}
            </div>
        );
    };