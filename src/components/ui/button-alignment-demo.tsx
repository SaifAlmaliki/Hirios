import React from "react"
import { ActionButton } from "@/components/ui/action-button"
import { FileText, Mic, ExternalLink, Star, X, Eye, ChevronDown } from "lucide-react"

const ButtonAlignmentDemo = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Button Alignment Demo</h1>
        <p className="text-gray-600">Consistent button widths and perfect row alignment</p>
      </div>

      {/* Two Row Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Two Row Layout - 3 Buttons Per Row</h2>
        <div className="grid grid-cols-3 gap-3 items-center max-w-2xl mx-auto">
          {/* First Row */}
          <ActionButton
            variant="cv"
            icon={FileText}
            text="Resume"
            shortText="CV"
          />
          <ActionButton
            variant="invite"
            icon={Mic}
            text="Invite"
            shortText="Invite"
          />
          <ActionButton
            variant="link"
            icon={ExternalLink}
            text="Copy Link"
            shortText="Link"
          />
          
          {/* Second Row */}
          <ActionButton
            variant="favorite"
            icon={Star}
            text="Favorite"
            shortText="Favorite"
            active={true}
          />
          <ActionButton
            variant="dismiss"
            icon={X}
            text="Dismiss"
            shortText="Dismiss"
          />
          <ActionButton
            variant="toggle"
            icon={ChevronDown}
            text="Details"
            shortText="Details"
          />
        </div>
      </div>

      {/* Responsive Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Two Row Layout - All Screen Sizes</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Consistent 3-column, 2-row layout across all devices:</p>
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {/* First Row */}
            <ActionButton variant="cv" icon={FileText} text="CV" shortText="CV" />
            <ActionButton variant="invite" icon={Mic} text="Invite" shortText="Invite" />
            <ActionButton variant="link" icon={ExternalLink} text="Link" shortText="Link" />
            
            {/* Second Row */}
            <ActionButton variant="favorite" icon={Star} text="Favorite" shortText="Favorite" />
            <ActionButton variant="dismiss" icon={X} text="Dismiss" shortText="Dismiss" />
            <ActionButton variant="toggle" icon={ChevronDown} text="Details" shortText="Details" />
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Loading States - Two Row Layout</h2>
        <div className="grid grid-cols-3 gap-3 items-center max-w-2xl mx-auto">
          {/* First Row */}
          <ActionButton
            variant="cv"
            icon={FileText}
            text="Loading..."
            shortText="..."
            loading={true}
          />
          <ActionButton
            variant="invite"
            icon={Mic}
            text="Sending..."
            shortText="..."
            loading={true}
          />
          <ActionButton
            variant="link"
            icon={ExternalLink}
            text="Processing..."
            shortText="..."
            loading={true}
          />
          
          {/* Second Row */}
          <ActionButton
            variant="favorite"
            icon={Star}
            text="Favorite"
            shortText="Favorite"
          />
          <ActionButton
            variant="dismiss"
            icon={X}
            text="Dismiss"
            shortText="Dismiss"
          />
          <ActionButton
            variant="toggle"
            icon={ChevronDown}
            text="Details"
            shortText="Details"
          />
        </div>
      </div>
    </div>
  )
}

export { ButtonAlignmentDemo }
