"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {Minus, Plus} from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
                     ...props
                   }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
                         className,
                         ...props
                       }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
      <AccordionPrimitive.Item
          data-slot="accordion-item"
          className={cn("border-b last:border-b-0", className)}
          {...props}
      />
  )
}

function AccordionTrigger({
                            className,
                            children,
                            ...props
                          }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={cn(
                "cursor-pointer group focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-base font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            {...props}
        >
          {children}

          {/* ICON */}
          <span className="relative size-4 shrink-0">

            {/* PLUS (closed) */}
            <Plus className="absolute inset-0 size-4 text-muted-foreground transition-opacity group-data-[state=open]:opacity-0" />

            {/* MINUS (open) */}
            <Minus className="absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity group-data-[state=open]:opacity-100" />
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
  )
}


function AccordionContent({
                            className,
                            children,
                            ...props
                          }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
      <AccordionPrimitive.Content
          data-slot="accordion-content"
          className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-base"
          {...props}
      >
        <div className={cn("pt-0 pb-4", className)}>{children}</div>
      </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }