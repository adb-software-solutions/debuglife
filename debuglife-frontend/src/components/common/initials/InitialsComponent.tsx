"use client";
import { SVGProps } from "react";

interface InitialsComponentProps extends SVGProps<SVGSVGElement> {
    name: string;
}

export default function InitialsComponent({
    name,
    ...props
}: InitialsComponentProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <svg
            width="32"
            height="32"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx="16" cy="16" r="16" fill="var(--color-sky-300)" />
            <text
                x="50%"
                y="50%"
                fontFamily="Arial"
                fontSize="12px"
                dy=".3em"
                textAnchor="middle"
                fill="var(--color-slate-900)"
            >
                {initials}
            </text>
        </svg>
    );
}