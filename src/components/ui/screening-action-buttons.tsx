import React from "react"
import { FileText, Mic, ExternalLink, Star, X, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { ActionButton } from "./action-button"
import { cn } from "@/lib/utils"

// CV Button Component
interface CVButtonProps {
  resumeUrl?: string
  onDownload: () => void
  className?: string
}

export const CVButton: React.FC<CVButtonProps> = ({ 
  resumeUrl, 
  onDownload, 
  className 
}) => {
  if (!resumeUrl) return null

  return (
    <div className="w-20 sm:w-24">
      <ActionButton
        variant="cv"
        icon={FileText}
        onClick={onDownload}
        text="Resume"
        shortText="CV"
        className={className}
      />
    </div>
  )
}

// Invite Button Component
interface InviteButtonProps {
  isRequestingInterview: boolean
  isVoiceScreeningRequested: boolean
  onClick: () => void
  className?: string
}

export const InviteButton: React.FC<InviteButtonProps> = ({
  isRequestingInterview,
  isVoiceScreeningRequested,
  onClick,
  className
}) => {
  return (
    <div className="w-28 sm:w-32 lg:w-36">
      <ActionButton
        variant="invite"
        icon={Mic}
        onClick={onClick}
        loading={isRequestingInterview}
        active={isVoiceScreeningRequested}
        text={isRequestingInterview ? "Sending..." : isVoiceScreeningRequested ? "Interview Sent" : "Invite"}
        shortText={isRequestingInterview ? "..." : isVoiceScreeningRequested ? "Sent" : "Invite"}
        disabled={isRequestingInterview || isVoiceScreeningRequested}
        className={className}
      />
    </div>
  )
}

// Link Button Component
interface LinkButtonProps {
  onClick: () => void
  className?: string
}

export const LinkButton: React.FC<LinkButtonProps> = ({ 
  onClick, 
  className 
}) => {
  return (
    <div className="w-20 sm:w-24 lg:w-28">
      <ActionButton
        variant="link"
        icon={ExternalLink}
        onClick={onClick}
        text="Copy Link"
        shortText="Link"
        className={className}
      />
    </div>
  )
}

// Favorite Button Component
interface FavoriteButtonProps {
  isFavorite: boolean
  isPending: boolean
  onClick: () => void
  className?: string
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  isPending,
  onClick,
  className
}) => {
  return (
    <div className="w-20 sm:w-24">
      <ActionButton
        variant="favorite"
        icon={Star}
        onClick={onClick}
        loading={isPending}
        active={isFavorite}
        text={isFavorite ? "Fav" : "Star"}
        shortText={isFavorite ? "Fav" : "Star"}
        className={cn(
          isFavorite && "fill-current",
          className
        )}
      />
    </div>
  )
}

// Dismiss Button Component
interface DismissButtonProps {
  isDismissed: boolean
  isPending: boolean
  onClick: () => void
  className?: string
}

export const DismissButton: React.FC<DismissButtonProps> = ({
  isDismissed,
  isPending,
  onClick,
  className
}) => {
  return (
    <div className="w-20 sm:w-24">
      <ActionButton
        variant="dismiss"
        icon={X}
        onClick={onClick}
        loading={isPending}
        active={isDismissed}
        text={isDismissed ? "Restore" : "Dismiss"}
        shortText={isDismissed ? "Restore" : "Dismiss"}
        className={className}
      />
    </div>
  )
}

// View Details Button Component
interface ViewDetailsButtonProps {
  onClick: () => void
  className?: string
}

export const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({ 
  onClick, 
  className 
}) => {
  return (
    <div className="w-20 sm:w-24 lg:w-28">
      <ActionButton
        variant="details"
        icon={Eye}
        onClick={onClick}
        text="View"
        shortText="View"
        className={className}
      />
    </div>
  )
}

// Details Toggle Button Component
interface DetailsToggleButtonProps {
  isExpanded: boolean
  onClick: () => void
  className?: string
}

export const DetailsToggleButton: React.FC<DetailsToggleButtonProps> = ({
  isExpanded,
  onClick,
  className
}) => {
  return (
    <div className="w-16 sm:w-20 lg:w-24">
      <ActionButton
        variant="toggle"
        icon={isExpanded ? ChevronUp : ChevronDown}
        onClick={onClick}
        text={isExpanded ? "Less" : "Details"}
        shortText={isExpanded ? "Less" : "Details"}
        className={className}
      />
    </div>
  )
}

