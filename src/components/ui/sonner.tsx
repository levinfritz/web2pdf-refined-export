import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { useEffect } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Add custom CSS for the close button positioning
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      [data-sonner-toast] [data-close-button] {
        position: absolute !important;
        right: 8px !important;
        left: auto !important;
        top: 8px !important;
        opacity: 1 !important;
      }
    `
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:opacity-100 group-[.toast]:text-foreground hover:group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
