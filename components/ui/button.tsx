import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                // Primary: bg #222222, text white, hover bg #383838
                default:
                    "cursor-pointer bg-[#222222] text-white hover:bg-[#383838]",

                // Outline: border #222222, hover filled #383838 with white text
                outline:
                    "cursor-pointer border border-[#222222] bg-transparent text-[#222222] hover:bg-[#383838] hover:text-white hover:border-[#383838]",

                // Ghost: text #383838, hover text #222222
                ghost:
                    "cursor-pointer bg-transparent text-[#383838] hover:text-[#222222]",

                // Secondary
                secondary:
                    "cursor-pointer bg-[#f8f8f8] text-[#222222] border border-[#bebebe] hover:border-[#222222]",

                // Destructive
                destructive:
                    "cursor-pointer bg-[#ef4444] text-white hover:bg-[#dc2626]",

                // Link
                link:
                    "cursor-pointer text-[#222222] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2 rounded-md",
                sm: "h-9 px-4 text-xs rounded-md",
                lg: "h-11 px-6 text-base rounded-md",
                xl: "h-12 px-8 text-base rounded-md",
                icon: "size-10 rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({
                    className,
                    variant,
                    size,
                    asChild = false,
                    ...props
                }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean
}) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }