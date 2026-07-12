'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, Settings, Music, Zap, Clock, Grid3x3, FileText,
  Mic, Radio, ChevronRight, Circle, Play, Square, Link2, AlertTriangle,
  BookOpen, Sliders, Keyboard
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

type NavPage = 'home' | 'cuegrid' | 'selector' | 'group' | 'player' | 'time' |
  'hub' | 'recording' | 'audio' | 'keybind' | 'timecode' | 'macro' | 'showfile' | 'docs' | 'info'

interface ProfileState {
  name: string
  key: string
  isLinked: boolean
  isFlagged: boolean
  isRecording: boolean
  isAudioRunning: boolean
}

// ============================================================================
// Main App
// ============================================================================

export default function BlurKitUI() {
  const [activePage, setActivePage] = useState<NavPage>('home')
  const [profile, setProfile] = useState<ProfileState>({
    name: 'Kinsoaki',
    key: 'BLUR-X8K2-9F3M',
    isLinked: true,
    isFlagged: false,
    isRecording: false,
    isAudioRunning: false,
  })

  // Toggle states for demo
  const toggleRecording = () => setProfile(p => ({ ...p, isRecording: !p.isRecording }))
  const toggleAudio = () => setProfile(p => ({ ...p, isAudioRunning: !p.isAudioRunning }))
  const toggleLinked = () => setProfile(p => ({ ...p, isLinked: !p.isLinked }))
  const toggleFlagged = () => setProfile(p => ({ ...p, isFlagged: !p.isFlagged }))

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] relative overflow-hidden">
      {/* Background gradient orbs for depth (liquid glass needs something behind it) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      {/* ─── Main Nav Bar ─── */}
      <MainNavBar
        activePage={activePage}
        onPageChange={setActivePage}
        profile={profile}
        onToggleRecording={toggleRecording}
        onToggleAudio={toggleAudio}
        onToggleLinked={toggleLinked}
        onToggleFlagged={toggleFlagged}
      />

      {/* ─── Secondary Nav Bar (context-specific) ─── */}
      <SecondaryNavBar activePage={activePage} />

      {/* ─── Workspace Area ─── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {activePage === 'home' && <HomePage profile={profile} />}
            {activePage !== 'home' && <PlaceholderPage page={activePage} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// Main Nav Bar — top bar with global pages + profile badge
// ============================================================================

const NAV_ITEMS: { key: NavPage; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'cuegrid', label: 'Cue Grid', icon: Grid3x3 },
  { key: 'selector', label: 'Selector', icon: Grid3x3 },
  { key: 'group', label: 'Groups', icon: Users },
  { key: 'player', label: 'Player', icon: Play },
  { key: 'time', label: 'Time', icon: Clock },
  { key: 'hub', label: 'Hub', icon: Zap },
  { key: 'recording', label: 'Recording', icon: Mic },
  { key: 'audio', label: 'Audio', icon: Music },
  { key: 'keybind', label: 'Keybinds', icon: Keyboard },
  { key: 'timecode', label: 'Timecode', icon: Clock },
  { key: 'macro', label: 'Macros', icon: FileText },
  { key: 'showfile', label: 'Showfile', icon: FileText },
  { key: 'docs', label: 'Docs', icon: BookOpen },
  { key: 'info', label: 'Info', icon: Settings },
]

function MainNavBar({
  activePage,
  onPageChange,
  profile,
  onToggleRecording,
  onToggleAudio,
  onToggleLinked,
  onToggleFlagged,
}: {
  activePage: NavPage
  onPageChange: (page: NavPage) => void
  profile: ProfileState
  onToggleRecording: () => void
  onToggleAudio: () => void
  onToggleLinked: () => void
  onToggleFlagged: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 glass-strong relative z-20 specular">
      {/* Version label (left) */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <span className="text-sm font-bold tracking-tight">BLUR</span>
        <span className="text-[9px] text-neutral-500 font-mono">v3.9.6</span>
      </div>

      {/* Global pages (center — scrollable) */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all glass-hover ${
                isActive ? 'bg-white/15 text-white border border-white/20' : 'text-neutral-400 border border-transparent'
              }`}
            >
              <Icon size={12} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Profile Badge (right) — liquid glass */}
      <ProfileBadge
        profile={profile}
        onToggleRecording={onToggleRecording}
        onToggleAudio={onToggleAudio}
        onToggleLinked={onToggleLinked}
        onToggleFlagged={onToggleFlagged}
      />
    </div>
  )
}

// ============================================================================
// Profile Badge — the liquid glass card with dynamic states
// ============================================================================

function ProfileBadge({
  profile,
  onToggleRecording,
  onToggleAudio,
  onToggleLinked,
  onToggleFlagged,
}: {
  profile: ProfileState
  onToggleRecording: () => void
  onToggleAudio: () => void
  onToggleLinked: () => void
  onToggleFlagged: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Determine the status indicator
  let StatusDot = null
  if (profile.isFlagged) {
    StatusDot = <div className="w-2 h-2 rounded-full bg-yellow-400 blink" />
  } else if (profile.isRecording && profile.isAudioRunning) {
    // Alternate between red dot and music note
    StatusDot = <AlternateStatus />
  } else if (profile.isRecording) {
    StatusDot = <div className="w-2 h-2 rounded-full bg-red-500 blink" />
  } else if (profile.isAudioRunning) {
    StatusDot = <Music size={10} className="text-blue-400 pulse" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`glass glass-hover relative flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full transition-all ${
          profile.isFlagged ? 'border-yellow-500/40' : ''
        }`}
      >
        {/* Profile circle with "P" */}
        <div className={`relative w-7 h-7 rounded-full glass-strong flex items-center justify-center ${
          profile.isFlagged ? 'border-yellow-500/50' : ''
        }`}>
          <span className="text-[11px] font-bold text-white">P</span>
          {/* Status dot overlay */}
          {StatusDot && (
            <div className="absolute -top-0.5 -right-0.5">
              {StatusDot}
            </div>
          )}
        </div>

        {/* Profile name + key */}
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-semibold gradient-text leading-tight">{profile.name}</span>
          <span className="text-[7px] text-neutral-500 font-mono leading-tight">{profile.key}</span>
        </div>

        {/* Linked status indicator */}
        <div className={`flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full ${
          profile.isLinked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-700/50 text-neutral-500'
        }`}>
          <Link2 size={8} />
          <span className="text-[7px] font-medium">{profile.isLinked ? 'Linked' : 'Offline'}</span>
        </div>
      </button>

      {/* Expanded panel — shows the 3 widgets + toggles */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 glass-strong rounded-2xl p-3 specular z-30"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <div className={`w-8 h-8 rounded-full glass flex items-center justify-center ${
                profile.isFlagged ? 'border-yellow-500/40' : ''
              }`}>
                <span className="text-xs font-bold">P</span>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold gradient-text">{profile.name}</p>
                <p className="text-[8px] text-neutral-500 font-mono">{profile.key}</p>
              </div>
            </div>

            {/* Warning area (if flagged) */}
            {profile.isFlagged && (
              <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle size={12} className="text-yellow-400" />
                <span className="text-[9px] text-yellow-300">Account flagged — contact admin</span>
              </div>
            )}

            {/* 3 Widgets: Recording, Audio, Quick Control */}
            <div className="space-y-1.5">
              <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Status</p>

              {/* Recording widget */}
              <button
                onClick={onToggleRecording}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg glass glass-hover transition-all`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  profile.isRecording ? 'bg-red-500/30' : 'bg-neutral-800/50'
                }`}>
                  {profile.isRecording ? (
                    <div className="w-2 h-2 rounded-full bg-red-500 blink" />
                  ) : (
                    <Mic size={10} className="text-neutral-500" />
                  )}
                </div>
                <span className="text-[10px] text-neutral-300">Recording</span>
                <span className={`ml-auto text-[8px] font-medium ${profile.isRecording ? 'text-red-400' : 'text-neutral-600'}`}>
                  {profile.isRecording ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Audio widget */}
              <button
                onClick={onToggleAudio}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg glass glass-hover transition-all`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  profile.isAudioRunning ? 'bg-blue-500/30' : 'bg-neutral-800/50'
                }`}>
                  <Music size={10} className={profile.isAudioRunning ? 'text-blue-400 pulse' : 'text-neutral-500'} />
                </div>
                <span className="text-[10px] text-neutral-300">Audio</span>
                <span className={`ml-auto text-[8px] font-medium ${profile.isAudioRunning ? 'text-blue-400' : 'text-neutral-600'}`}>
                  {profile.isAudioRunning ? 'RUNNING' : 'IDLE'}
                </span>
              </button>

              {/* Quick control (link toggle) */}
              <button
                onClick={onToggleLinked}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg glass glass-hover transition-all`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  profile.isLinked ? 'bg-emerald-500/30' : 'bg-neutral-800/50'
                }`}>
                  <Link2 size={10} className={profile.isLinked ? 'text-emerald-400' : 'text-neutral-500'} />
                </div>
                <span className="text-[10px] text-neutral-300">Connection</span>
                <span className={`ml-auto text-[8px] font-medium ${profile.isLinked ? 'text-emerald-400' : 'text-neutral-600'}`}>
                  {profile.isLinked ? 'LINKED' : 'OFFLINE'}
                </span>
              </button>
            </div>

            {/* Flag toggle (for demo) */}
            <div className="mt-3 pt-2 border-t border-white/10">
              <button
                onClick={onToggleFlagged}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[8px] text-neutral-500 hover:text-yellow-400 transition-colors"
              >
                <AlertTriangle size={10} />
                {profile.isFlagged ? 'Unflag Account' : 'Flag Account (demo)'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Alternate Status — blinks between recording dot and music note
// ============================================================================

function AlternateStatus() {
  const [showRecording, setShowRecording] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowRecording(s => !s)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  if (showRecording) {
    return <div className="w-2 h-2 rounded-full bg-red-500" />
  }
  return <Music size={10} className="text-blue-400" />
}

// ============================================================================
// Secondary Nav Bar — context-specific tabs
// ============================================================================

function SecondaryNavBar({ activePage }: { activePage: NavPage }) {
  // Different secondary tabs per page
  const secondaryTabs: Record<string, string[]> = {
    home: [],
    cuegrid: ['Page 1', 'Page 2', 'Page 3'],
    selector: ['Tree', 'Grid', 'Auto'],
    group: ['List', 'Auto-Group', 'Suggestions'],
    player: ['Play', 'Pause', 'Stop'],
    time: ['Clock', 'Brightness', 'Fog', 'Ambient'],
    hub: ['Browse', 'My Effects', 'Upload'],
    recording: ['Record', 'Saved', 'Convert'],
    audio: ['File', 'Desktop', 'EQ'],
    keybind: ['Effects', 'Cues', 'Toggles', 'Positions', 'Macros'],
    timecode: ['Timeline', 'Tracks', 'Settings'],
    macro: ['List', 'Editor'],
    showfile: ['Save', 'Load', 'Auto-save'],
    docs: ['Getting Started', 'Cues', 'Ripple', 'API'],
    info: ['Connection', 'License', 'About'],
  }

  const tabs = secondaryTabs[activePage] || []
  if (tabs.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 glass border-t border-white/5 relative z-10">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all glass-hover ${
            i === 0 ? 'bg-white/10 text-white' : 'text-neutral-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// Home Page — welcome message + flagged/update area
// ============================================================================

function HomePage({ profile }: { profile: ProfileState }) {
  const [showVersion, setShowVersion] = useState(false)

  useEffect(() => {
    // After 3s, switch from "Welcome" to version
    const timer = setTimeout(() => setShowVersion(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      {/* Flagged warning area (Home only) */}
      {profile.isFlagged && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-strong px-4 py-2 rounded-xl flex items-center gap-2 border-yellow-500/30">
          <AlertTriangle size={14} className="text-yellow-400" />
          <span className="text-[11px] text-yellow-300">Your account has been flagged. Please contact an administrator.</span>
        </div>
      )}

      {/* Welcome / Version text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <AnimatePresence mode="wait">
          {!showVersion ? (
            <motion.div
              key="welcome"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-bold gradient-text">Welcome, {profile.name}</h1>
              <p className="text-sm text-neutral-500">Your stage is ready.</p>
            </motion.div>
          ) : (
            <motion.div
              key="version"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-5xl font-bold tracking-tight">BLUR</h1>
              <p className="text-sm text-neutral-500 font-mono">Version 3.9.6</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`px-3 py-1 rounded-full glass text-[10px] flex items-center gap-1.5 ${
                  profile.isLinked ? 'text-emerald-300' : 'text-neutral-500'
                }`}>
                  <Link2 size={10} />
                  {profile.isLinked ? 'Linked to Roblox' : 'Not connected'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick action cards */}
      <div className="grid grid-cols-3 gap-3 mt-12 max-w-md">
        {[
          { label: 'Cue Grid', icon: Grid3x3, color: 'text-purple-300' },
          { label: 'Effects', icon: Zap, color: 'text-cyan-300' },
          { label: 'Recording', icon: Mic, color: 'text-red-300' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="glass glass-hover rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer specular"
            >
              <Icon size={20} className={card.color} />
              <span className="text-[10px] text-neutral-400">{card.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Placeholder page for other tabs
// ============================================================================

function PlaceholderPage({ page }: { page: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="glass rounded-2xl p-8 text-center specular">
        <p className="text-sm text-neutral-400 capitalize">{page}</p>
        <p className="text-[10px] text-neutral-600 mt-1">This panel will be built next</p>
      </div>
    </div>
  )
}
