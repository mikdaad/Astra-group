"use client"

import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast: "bg-zinc-900 border border-orange-600/30 text-white shadow-lg",
          title: "text-white",
          description: "text-zinc-300",
          actionButton: "bg-orange-600 text-white hover:bg-orange-700",
          cancelButton: "bg-zinc-700 text-white hover:bg-zinc-600",
          success: "border-green-600/40",
          error: "border-red-600/40",
          warning: "border-yellow-600/40",
          info: "border-orange-600/30",
          closeButton: "text-zinc-400 hover:text-white",
        },
      }}
      {...props}
    />
  )
}


