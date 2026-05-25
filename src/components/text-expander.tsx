"use client";

import React, { useState } from "react";

function TextExpander({ children, options }: {
    children: String, options?: {
        max: number
    }
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const displayText = isExpanded
        ? children
        : children.split(" ").slice(0, options?.max || 40).join(" ") + "...";

    return (
        <div>
            {displayText}{" "}
            <button
                className="text-primary-700 border-b border-primary-700 leading-3 pb-1"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? "Lihat lebih sedikit" : "Lihat lebih lengkap"}
            </button>
        </div>
    );
}

export default TextExpander;