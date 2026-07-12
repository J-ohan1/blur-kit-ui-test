'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Mic, Radio, Link2, AlertTriangle, Circle
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

  return (
    <div className="h-screen w-screen flex flex-col bg-black relative overflow-hidden">
      {/* Animated background orbs — slowly moving, reactive */}
      <AnimatedBackground />

      {/* Floating Nav Bar */}
      <FloatingNavBar
        activePage={activePage}
        onPageChange={setActivePage}
        profile={profile}
        onToggleRecording={() => setProfile(p => ({ ...p, isRecording: !p.isRecording }))}
        onToggleAudio={() => setProfile(p => ({ ...p, isAudioRunning: !p.isAudioRunning }))}
        onToggleLinked={() => setProfile(p => ({ ...p, isLinked: !p.isLinked }))}
        onToggleFlagged={() => setProfile(p => ({ ...p, isFlagged: !p.isFlagged }))}
      />

      {/* Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {activePage === 'home' ? (
              <HomePage profile={profile} />
            ) : (
              <PlaceholderPage page={activePage} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// Animated Background — slow moving gradient orbs
// ============================================================================

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        animate={{
          x: ['-10%', '60%', '30%', '-10%'],
          y: ['-10%', '30%', '60%', '-10%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: 'rgba(255,255,255,0.02)' }}
        animate={{
          x: ['80%', '20%', '50%', '80%'],
          y: ['60%', '20%', '40%', '60%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{ background: 'rgba(255,255,255,0.015)' }}
        animate={{
          x: ['40%', '10%', '70%', '40%'],
          y: ['70%', '40%', '20%', '70%'],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ============================================================================
// Floating Nav Bar — centered, floating, glass
// ============================================================================

const NAV_ITEMS: { key: NavPage; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'cuegrid', label: 'Cue Grid' },
  { key: 'selector', label: 'Selector' },
  { key: 'group', label: 'Groups' },
  { key: 'player', label: 'Player' },
  { key: 'time', label: 'Time' },
  { key: 'hub', label: 'Hub' },
  { key: 'recording', label: 'Recording' },
  { key: 'audio', label: 'Audio' },
  { key: 'keybind', label: 'Keybinds' },
  { key: 'timecode', label: 'Timecode' },
  { key: 'macro', label: 'Macros' },
  { key: 'showfile', label: 'Showfile' },
  { key: 'docs', label: 'Docs' },
  { key: 'info', label: 'Info' },
]

function FloatingNavBar({
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
    <div className="px-4 pt-3 pb-2 relative z-20">
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-2xl relative"
        style={{
          background: 'rgba(20,20,20,0.6)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Version — far left */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-white/10 flex-shrink-0">
          <span className="text-sm font-bold tracking-tight text-white">Blur</span>
          <span className="text-[8px] text-neutral-600 font-mono">v3.9.6</span>
        </div>

        {/* Global buttons — CENTERED */}
        <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key
            return (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Profile Badge — far right */}
        <ProfileBadge
          profile={profile}
          onToggleRecording={onToggleRecording}
          onToggleAudio={onToggleAudio}
          onToggleLinked={onToggleLinked}
          onToggleFlagged={onToggleFlagged}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Profile Badge — compact, just P icon + name, no key visible
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
  // Determine status indicator on the P icon
  let statusElement: React.ReactNode = null
  if (profile.isFlagged) {
    statusElement = <div className="w-2 h-2 rounded-full bg-yellow-400" style={{ animation: 'blink 1s infinite' }} />
  } else if (profile.isRecording && profile.isAudioRunning) {
    statusElement = <AlternateStatus />
  } else if (profile.isRecording) {
    statusElement = <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'blink 1s infinite' }} />
  } else if (profile.isAudioRunning) {
    statusElement = <Radio size={8} className="text-blue-400" style={{ animation: 'pulse 0.8s infinite' }} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-all flex-shrink-0 ${
            profile.isFlagged
              ? 'border border-yellow-500/40'
              : 'border border-white/10'
          } hover:bg-white/5`}
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {/* P icon with status dot */}
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center bg-white/5">
            <span className="text-[11px] font-bold text-white">P</span>
            {statusElement && (
              <div className="absolute -top-0.5 -right-0.5 z-10">
                {statusElement}
              </div>
            )}
          </div>
          {/* Just the name — NO key visible on the badge */}
          <span className="text-[10px] font-medium text-white">{profile.name}</span>
          {/* Linked indicator — minimal dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${profile.isLinked ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-0 rounded-2xl border-white/10 bg-neutral-950/80"
        style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
      >
        {/* Header — P icon + Name + Key (shown HERE in dropdown, not on badge) */}
        <div className="flex items-center gap-3 p-3 pb-2">
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${
            profile.isFlagged ? 'border border-yellow-500/40' : ''
          }`}>
            <span className="text-sm font-bold text-white">P</span>
            {statusElement && (
              <div className="absolute -top-0.5 -right-0.5 z-10">
                {statusElement}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{profile.name}</p>
            <p className="text-[8px] text-neutral-600 font-mono">{profile.key}</p>
          </div>
        </div>

        {/* Flagged warning */}
        {profile.isFlagged && (
          <div className="mx-3 mb-2 flex items-center gap-2 px-2.5 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0" />
            <span className="text-[9px] text-yellow-300">Account flagged</span>
          </div>
        )}

        {/* Status widgets */}
        <div className="px-3 pb-2 space-y-1">
          <p className="text-[8px] uppercase tracking-wider text-neutral-700 font-semibold pt-1 pb-1">Status</p>

          {/* Recording */}
          <button
            onClick={onToggleRecording}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              profile.isRecording ? 'bg-red-500/20' : 'bg-white/5'
            }`}>
              {profile.isRecording ? (
                <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'blink 1s infinite' }} />
              ) : (
                <Mic size={10} className="text-neutral-600" />
              )}
            </div>
            <span className="text-[10px] text-neutral-300">Recording</span>
            <span className={`ml-auto text-[8px] font-medium ${profile.isRecording ? 'text-red-400' : 'text-neutral-700'}`}>
              {profile.isRecording ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Audio */}
          <button
            onClick={onToggleAudio}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              profile.isAudioRunning ? 'bg-blue-500/20' : 'bg-white/5'
            }`}>
              <Radio size={10} className={profile.isAudioRunning ? 'text-blue-400' : 'text-neutral-600'} style={profile.isAudioRunning ? { animation: 'pulse 0.8s infinite' } : {}} />
            </div>
            <span className="text-[10px] text-neutral-300">Audio</span>
            <span className={`ml-auto text-[8px] font-medium ${profile.isAudioRunning ? 'text-blue-400' : 'text-neutral-700'}`}>
              {profile.isAudioRunning ? 'RUNNING' : 'IDLE'}
            </span>
          </button>

          {/* Connection */}
          <button
            onClick={onToggleLinked}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              profile.isLinked ? 'bg-emerald-500/20' : 'bg-white/5'
            }`}>
              <Link2 size={10} className={profile.isLinked ? 'text-emerald-400' : 'text-neutral-600'} />
            </div>
            <span className="text-[10px] text-neutral-300">Connection</span>
            <span className={`ml-auto text-[8px] font-medium ${profile.isLinked ? 'text-emerald-400' : 'text-neutral-700'}`}>
              {profile.isLinked ? 'LINKED' : 'OFFLINE'}
            </span>
          </button>
        </div>

        <DropdownMenuSeparator className="bg-white/5" />

        {/* Flag toggle (demo) */}
        <div className="p-2">
          <button
            onClick={onToggleFlagged}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[8px] text-neutral-600 hover:text-yellow-400 transition-colors"
          >
            <AlertTriangle size={10} />
            {profile.isFlagged ? 'Unflag Account' : 'Flag Account (demo)'}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Alternate Status — blinks between recording dot and audio icon
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
  return <Radio size={8} className="text-blue-400" />
}

// ============================================================================
// Home Page — rotating BLUR text + welcome
// ============================================================================

function HomePage({ profile }: { profile: ProfileState }) {
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      {/* Flagged warning (Home only) */}
      {profile.isFlagged && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl flex items-center gap-2"
          style={{
            background: 'rgba(20,20,20,0.6)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,200,0,0.2)',
          }}
        >
          <AlertTriangle size={12} className="text-yellow-400" />
          <span className="text-[10px] text-yellow-300">Your account has been flagged. Please contact an administrator.</span>
        </motion.div>
      )}

      {/* Rotating BLUR text — 5 copies, slowly rotating around center */}
      <div className="relative w-96 h-96 flex items-center justify-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute text-5xl font-bold tracking-tight"
            style={{
              color: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
          >
            <span style={{ display: 'inline-block', transform: `translateY(${i * 8 - 16}px)` }}>
              BLUR
            </span>
          </motion.div>
        ))}

        {/* Center content — welcome or version */}
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <motion.div
                key="welcome"
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-1"
              >
                <p className="text-[11px] text-neutral-600 uppercase tracking-widest">Welcome</p>
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
              </motion.div>
            ) : (
              <motion.div
                key="version"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-1"
              >
                <h1 className="text-4xl font-bold tracking-tight text-white">Blur</h1>
                <p className="text-[10px] text-neutral-600 font-mono">Version 3.9.6</p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${profile.isLinked ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                  <span className="text-[9px] text-neutral-500">{profile.isLinked ? 'Linked' : 'Offline'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Placeholder page
// ============================================================================

function PlaceholderPage({ page }: { page: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(20,20,20,0.4)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-sm text-neutral-400 capitalize">{page}</p>
        <p className="text-[10px] text-neutral-700 mt-1">This panel will be built next</p>
      </div>
    </div>
  )
}
