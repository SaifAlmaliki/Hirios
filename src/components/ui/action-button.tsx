import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const actionButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        cv: "border border-green-300 bg-background text-green-600 hover:bg-green-50 hover:border-green-400 shadow-sm",
        invite: "border border-blue-300 bg-background text-blue-600 hover:bg-blue-50 hover:border-blue-400 shadow-sm",
        link: "border border-purple-300 bg-background text-purple-600 hover:bg-purple-50 hover:border-purple-400 shadow-sm",
        favorite: "border border-yellow-300 bg-background text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 shadow-sm",
        dismiss: "border border-red-300 bg-background text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm",
        details: "border border-indigo-300 bg-background text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 shadow-sm",
        toggle: "border-0 bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-none",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
        fixed: "w-20 sm:w-24",
        fixedLg: "w-28 sm:w-32 lg:w-36",
        fixedXl: "w-20 sm:w-24 lg:w-28",
      },
      state: {
        default: "",
        active: "bg-opacity-10 shadow-md",
        loading: "animate-pulse",
      }
    },
    defaultVariants: {
      variant: "cv",
      size: "sm",
      width: "fixed",
      state: "default",
    },
  }
)

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  icon?: LucideIcon
  iconPosition?: "left" | "right"
  loading?: boolean
  active?: boolean
  showText?: boolean
  text?: string
  shortText?: string
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    width, 
    state, 
    icon: Icon, 
    iconPosition = "left",
    loading = false,
    active = false,
    showText = true,
    text,
    shortText,
    children,
    ...props 
  }, ref) => {
    const currentState = loading ? "loading" : active ? "active" : "default"
    
    return (
      <button
        className={cn(
          actionButtonVariants({ 
            variant, 
            size, 
            width, 
            state: currentState,
            className 
          })
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && Icon && iconPosition === "left" && (
          <Icon className="h-4 w-4" />
        )}
        {showText && (
          <span className="hidden xs:inline">
            {text || children}
          </span>
        )}
        {showText && shortText && (
          <span className="xs:hidden">
            {shortText}
          </span>
        )}
        {!loading && Icon && iconPosition === "right" && (
          <Icon className="h-4 w-4" />
        )}
      </button>
    )
  }
)
ActionButton.displayName = "ActionButton"

export { ActionButton, actionButtonVariants }
