'use client'

import { useEffect, useRef } from 'react'

interface ElevenLabsChatbotProps {
  agentId: string
  avatarImageUrl?: string
  avatarOrbColor1?: string
  avatarOrbColor2?: string
  actionText?: string
  customColors?: {
    primary?: string
    secondary?: string
  }
  className?: string
}

export default function ElevenLabsChatbot({
  agentId,
  avatarImageUrl,
  avatarOrbColor1 = '#6DB035',
  avatarOrbColor2 = '#F5CABB',
  actionText,
  customColors,
  className,
}: ElevenLabsChatbotProps) {
  const scriptLoaded = useRef(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load the ElevenLabs script only once
    if (!scriptLoaded.current && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@latest/dist/index.js'
      script.async = true
      script.type = 'text/javascript'
      document.body.appendChild(script)
      scriptLoaded.current = true

      // Clean up script when component unmounts
      return () => {
        const existingScript = document.querySelector('script[src*="convai-widget-embed"]')
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Inject styles into shadow DOM after widget loads
    const injectShadowStyles = () => {
      const chatbotElement = document.querySelector('elevenlabs-convai')
      if (!chatbotElement) return

      const shadowRoot = chatbotElement.shadowRoot
      if (!shadowRoot) return

      // Get all overlay divs in shadow root and hide the last one (the "Powered by ElevenLabs" footer)
      const allOverlays = shadowRoot.querySelectorAll('.overlay')
      if (allOverlays.length > 1) {
        const lastOverlay = allOverlays[allOverlays.length - 1] as HTMLElement
        lastOverlay.style.setProperty('display', 'none', 'important')
      }
    }

    // Try immediately and after a delay to catch the widget
    injectShadowStyles()
    const interval = setInterval(() => {
      injectShadowStyles()
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const attributes: Record<string, string> = {
    'agent-id': agentId,
  }

  if (avatarImageUrl) {
    attributes['avatar-image-url'] = avatarImageUrl
  }

  if (actionText) {
    attributes['action-text'] = actionText
  }

  if (customColors?.primary) {
    attributes['avatar-orb-color-1'] = customColors.primary
  }

  if (customColors?.secondary) {
    attributes['avatar-orb-color-2'] = customColors.secondary
  }

  return (
    <div ref={widgetRef} className={className}>
      <elevenlabs-convai {...attributes} />
    </div>
  )
}

