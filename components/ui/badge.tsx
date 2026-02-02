import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "uppercase inline-flex items-center justify-center rounded-sm px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors border",
    {
        variants: {
            variant: {
                // Default
                default:
                    "border-[#222222] text-[#222222] bg-transparent",

                // DEV badge - #a1b9cf
                dev:
                    "border-[#a1b9cf] text-[#a1b9cf] bg-transparent",

                // SOTD badge - #d7876d
                sotd:
                    "border-[#d7876d] text-[#d7876d] bg-transparent",

                // PROMOTED
                promoted:
                    "border-[#bebebe] text-[#222222] bg-transparent",

                // Secondary
                secondary:
                    "border-[#bebebe] text-[#222222] bg-transparent",

                // Destructive
                destructive:
                    "border-[#ef4444] text-[#ef4444] bg-transparent",

                // Success
                success:
                    "border-[#22c55e] text-[#22c55e] bg-transparent",

                // Warning
                warning:
                    "border-[#f59e0b] text-[#f59e0b] bg-transparent",

                // Info
                info:
                    "border-[#3b82f6] text-[#3b82f6] bg-transparent",

                // Outline (generic)
                outline:
                    "border-[#bebebe] text-[#222222] bg-transparent",

                // Promotion
                promotion:
                    "border-[#d7876d] text-[#d7876d] bg-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
                   className,
                   variant,
                   asChild = false,
                   ...props
               }: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span"

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }