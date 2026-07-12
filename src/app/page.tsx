'use client'

import { useState, useEffect } from 'react'
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
import { Mic, Radio, Link2, AlertTriangle } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Apple HIG Design System — translated to React/Tailwind
// ═══════════════════════════════════════════════════════════════
//
// Principles: Clarity, Deference, Depth
// Typography: SF Pro / system font, semantic text styles
// Colors: Semantic (primary/secondary/tertiary labels)
// Spacing: 8pt grid (4, 8, 16, 24, 32)
// Motion: Spring physics, 0.2-0.5s durations
// Touch targets: Minimum 44×44pt
// Borders: Minimal, use separation through depth/fill instead
//

// ─── Types ───

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

// ─── Apple semantic color tokens (dark mode) ───

const colors = {
  labelPrimary: 'text-white',
  labelSecondary: 'text-white/60',
  labelTertiary: 'text-white/30',
  labelQuaternary: 'text-white/18',
  fillPrimary: 'bg-white/[0.12]',
  fillSecondary: 'bg-white/[0.08]',
  fillTertiary: 'bg-white/[0.05]',
  separator: 'border-white/10',
  bgPrimary: 'bg-black',
  bgSecondary: 'bg-[#1c1c1e]',
  bgTertiary: 'bg-[#2c2c2e]',
}

// ─── Apple easing curves ───

const appleEase = [0.4, 0, 0.2, 1] as const
const appleSpring = { type: 'spring', stiffness: 300, damping: 30 } as const

// ═══════════════════════════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════════════════════════

export default function BlurKitUI() {
  const [activePage, setActivePage] = useState<NavPage>('home')
  const [profile, setProfile] = useState<ProfileState>({
    name: 'Kinsoaki',
    key: 'BLURX8K29F3M7Q1P4Z6W8L2NC',
    isLinked: true,
    isFlagged: false,
    isRecording: false,
    isAudioRunning: false,
  })

  return (
    <div className="h-screen w-screen flex flex-col bg-black relative overflow-hidden">
      {/* Subtle ambient background — Apple deference principle */}
      <AmbientBackground />

      {/* Navigation */}
      <FloatingNav
        activePage={activePage}
        onPageChange={setActivePage}
        profile={profile}
        onToggleRecording={() => setProfile(p => ({ ...p, isRecording: !p.isRecording }))}
        onToggleAudio={() => setProfile(p => ({ ...p, isAudioRunning: !p.isAudioRunning }))}
        onToggleLinked={() => setProfile(p => ({ ...p, isLinked: !p.isLinked }))}
        onToggleFlagged={() => setProfile(p => ({ ...p, isFlagged: !p.isFlagged }))}
      />

      {/* Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: appleEase }}
            className="absolute inset-0"
          >
            {activePage === 'home' ? (
              <HomeView profile={profile} />
            ) : (
              <PlaceholderView page={activePage} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Ambient Background — deference: content is the focus
// ═══════════════════════════════════════════════════════════════

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'rgba(255,255,255,0.02)' }}
        animate={{ x: ['-10%', '50%', '20%', '-10%'], y: ['-10%', '30%', '50%', '-10%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: 'rgba(255,255,255,0.015)' }}
        animate={{ x: ['70%', '20%', '40%', '70%'], y: ['50%', '20%', '30%', '50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Floating Navigation — glass, centered, minimal
// ═══════════════════════════════════════════════════════════════

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

function FloatingNav({
  activePage, onPageChange, profile,
  onToggleRecording, onToggleAudio, onToggleLinked, onToggleFlagged,
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
    <nav className="px-4 pt-3 pb-2 relative z-20">
      <div
        className="rounded-2xl relative overflow-hidden"
        style={{
          background: 'rgba(28, 28, 30, 0.72)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '0.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="relative flex items-center gap-2 px-3 py-2">
          {/* App identity — left */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-white/10 flex-shrink-0">
            <span className="text-sm font-bold tracking-tight text-white">Blur</span>
            <span className="text-[8px] text-white/30 font-mono">v3.9.6</span>
          </div>

          {/* Navigation buttons — centered */}
          <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto nav-scroll">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap min-h-[32px] ${
                  activePage === item.key
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Profile — right */}
          <ProfileMenu
            profile={profile}
            onToggleRecording={onToggleRecording}
            onToggleAudio={onToggleAudio}
            onToggleLinked={onToggleLinked}
            onToggleFlagged={onToggleFlagged}
          />
        </div>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// Profile Menu — shadcn DropdownMenu, Apple list style
// ═══════════════════════════════════════════════════════════════

function maskKey(key: string): string {
  if (key.length <= 10) return key
  return key.substring(0, 5) + '•••••' + key.substring(key.length - 5)
}

function ProfileMenu({
  profile, onToggleRecording, onToggleAudio, onToggleLinked, onToggleFlagged,
}: {
  profile: ProfileState
  onToggleRecording: () => void
  onToggleAudio: () => void
  onToggleLinked: () => void
  onToggleFlagged: () => void
}) {
  // Status indicator
  let statusDot: React.ReactNode = null
  if (profile.isFlagged) {
    statusDot = <div className="w-2 h-2 rounded-full bg-yellow-400" style={{ animation: 'smoothBlink 1.5s ease-in-out infinite' }} />
  } else if (profile.isRecording && profile.isAudioRunning) {
    statusDot = <AlternateStatus />
  } else if (profile.isRecording) {
    statusDot = <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'smoothBlink 1.5s ease-in-out infinite' }} />
  } else if (profile.isAudioRunning) {
    statusDot = <Radio size={8} className="text-blue-400" style={{ animation: 'smoothPulse 1.2s ease-in-out infinite' }} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full transition-all flex-shrink-0 border min-h-[36px] ${
            profile.isFlagged ? 'border-yellow-500/30' : 'border-white/10'
          } hover:bg-white/[0.08]`}
        >
          {/* Avatar */}
          <Avatar className="w-7 h-7 rounded-full bg-white/[0.08]">
            <AvatarFallback className="bg-transparent text-[11px] font-bold text-white">
              P
            </AvatarFallback>
          </Avatar>
          {/* Name only — no key */}
          <span className="text-[10px] font-medium text-white">{profile.name}</span>
          {/* Linked dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${profile.isLinked ? 'bg-emerald-400' : 'bg-white/20'}`} />
          {/* Status dot */}
          {statusDot && <div className="absolute top-1 right-1">{statusDot}</div>}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-0 rounded-2xl border-white/10"
        style={{
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(50px) saturate(200%)',
          WebkitBackdropFilter: 'blur(50px) saturate(200%)',
          border: '0.5px solid rgba(255,255,255,0.15)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Header — Apple grouped list style */}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] ${
            profile.isFlagged ? 'border border-yellow-500/30' : ''
          }`}>
            <span className="text-sm font-bold text-white">P</span>
            {statusDot && <div className="absolute -top-0.5 -right-0.5">{statusDot}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{profile.name}</p>
            <p className="text-[9px] text-white/30 font-mono">{maskKey(profile.key)}</p>
          </div>
        </div>

        {/* Flagged warning */}
        {profile.isFlagged && (
          <div className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10">
            <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0" />
            <span className="text-[10px] text-yellow-300">Account flagged</span>
          </div>
        )}

        {/* Status section — Apple grouped list */}
        <div className="px-3 pb-2">
          <p className="text-[9px] uppercase tracking-wider text-white/20 font-semibold px-1 py-1.5">Status</p>

          {/* Recording */}
          <DropdownMenuItem
            onClick={onToggleRecording}
            className="rounded-lg cursor-pointer focus:bg-white/[0.06] py-2"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile.isRecording ? 'bg-red-500/20' : 'bg-white/[0.05]'}`}>
              {profile.isRecording ? (
                <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'smoothBlink 1.5s ease-in-out infinite' }} />
              ) : (
                <Mic size={10} className="text-white/30" />
              )}
            </div>
            <span className="text-[11px] text-white/80 ml-2">Recording</span>
            <Badge variant="outline" className={`ml-auto text-[8px] border-none ${profile.isRecording ? 'text-red-400 bg-red-500/10' : 'text-white/20'}`}>
              {profile.isRecording ? 'ON' : 'OFF'}
            </Badge>
          </DropdownMenuItem>

          {/* Audio */}
          <DropdownMenuItem
            onClick={onToggleAudio}
            className="rounded-lg cursor-pointer focus:bg-white/[0.06] py-2"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile.isAudioRunning ? 'bg-blue-500/20' : 'bg-white/[0.05]'}`}>
              <Radio size={10} className={profile.isAudioRunning ? 'text-blue-400' : 'text-white/30'} style={profile.isAudioRunning ? { animation: 'smoothPulse 1.2s ease-in-out infinite' } : {}} />
            </div>
            <span className="text-[11px] text-white/80 ml-2">Audio</span>
            <Badge variant="outline" className={`ml-auto text-[8px] border-none ${profile.isAudioRunning ? 'text-blue-400 bg-blue-500/10' : 'text-white/20'}`}>
              {profile.isAudioRunning ? 'ACTIVE' : 'IDLE'}
            </Badge>
          </DropdownMenuItem>

          {/* Connection */}
          <DropdownMenuItem
            onClick={onToggleLinked}
            className="rounded-lg cursor-pointer focus:bg-white/[0.06] py-2"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile.isLinked ? 'bg-emerald-500/20' : 'bg-white/[0.05]'}`}>
              <Link2 size={10} className={profile.isLinked ? 'text-emerald-400' : 'text-white/30'} />
            </div>
            <span className="text-[11px] text-white/80 ml-2">Connection</span>
            <Badge variant="outline" className={`ml-auto text-[8px] border-none ${profile.isLinked ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20'}`}>
              {profile.isLinked ? 'LINKED' : 'OFFLINE'}
            </Badge>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-white/[0.06]" />

        <div className="p-2">
          <DropdownMenuItem
            onClick={onToggleFlagged}
            className="rounded-lg cursor-pointer focus:bg-white/[0.06] justify-center py-1.5"
          >
            <AlertTriangle size={10} className="text-white/20" />
            <span className="text-[9px] text-white/30 ml-1.5">
              {profile.isFlagged ? 'Unflag Account' : 'Flag Account (demo)'}
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ═══════════════════════════════════════════════════════════════
// Alternate Status — smooth crossfade between recording + audio
// ═══════════════════════════════════════════════════════════════

function AlternateStatus() {
  const [showRecording, setShowRecording] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setShowRecording(s => !s), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {showRecording ? (
        <motion.div
          key="rec"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: appleEase }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
      ) : (
        <motion.div
          key="aud"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: appleEase }}
        >
          <Radio size={8} className="text-blue-400" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════
// Home View — Welcome → Blur + version (no rotating text)
// ═══════════════════════════════════════════════════════════════

function HomeView({ profile }: { profile: ProfileState }) {
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center relative px-8">
      {/* Flagged warning — Home only */}
      {profile.isFlagged && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: appleEase }}
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl flex items-center gap-2"
          style={{
            background: 'rgba(28, 28, 30, 0.72)',
            backdropFilter: 'blur(30px)',
            border: '0.5px solid rgba(255,200,0,0.2)',
          }}
        >
          <AlertTriangle size={12} className="text-yellow-400" />
          <span className="text-[10px] text-yellow-300">Your account has been flagged. Please contact an administrator.</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {showWelcome ? (
          // Phase 1: Welcome [user]
          <motion.div
            key="welcome"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: appleEase }}
            className="text-center"
          >
            <p className="text-[12px] text-white/40 uppercase tracking-widest mb-2 font-medium">
              Welcome
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: appleEase, delay: 0.1 }}
              className="text-4xl font-bold text-white tracking-tight"
            >
              {profile.name}
            </motion.h1>
          </motion.div>
        ) : (
          // Phase 2: Blur + version (no rotating text)
          <motion.div
            key="blur"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold tracking-tight text-white">
              Blur
            </h1>
            <p className="text-[11px] text-white/30 font-mono mt-3">
              Version 3.9.6
            </p>
            {/* Linked status */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <div className={`w-1.5 h-1.5 rounded-full ${profile.isLinked ? 'bg-emerald-400' : 'bg-white/20'}`} />
              <span className="text-[10px] text-white/40">
                {profile.isLinked ? 'Linked to Roblox' : 'Not connected'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Placeholder View — other tabs
// ═══════════════════════════════════════════════════════════════

function PlaceholderView({ page }: { page: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(28, 28, 30, 0.5)',
          backdropFilter: 'blur(30px)',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-sm text-white/60 capitalize">{page}</p>
        <p className="text-[10px] text-white/20 mt-1">This panel will be built next</p>
      </div>
    </div>
  )
}
