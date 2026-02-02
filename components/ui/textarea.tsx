import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "min-h-[120px] w-full bg-transparent px-3 py-3 text-base transition-colors duration-200",
                "border border-border rounded-md",
                "text-[#222222]",
                "placeholder:text-[#bebebe]",
                "focus:border-[#222222] focus:outline-none",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "aria-invalid:border-[#ef4444]",
                "md:text-sm",
                "resize-none",
                className
            )}
            {...props}
        />
    )
}

export { Textarea }