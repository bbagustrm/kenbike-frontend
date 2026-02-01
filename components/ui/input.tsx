import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "h-10 w-full min-w-0 bg-transparent px-0 py-2 text-base transition-colors duration-200",
                "border-0 border-b border-[#ededed]",
                "text-[#222222]",
                "placeholder:text-[#bebebe]",
                "focus:border-[#222222] focus:outline-none",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#222222]",
                "aria-invalid:border-[#ef4444]",
                "md:text-sm",
                className
            )}
            {...props}
        />
    )
}

export { Input }