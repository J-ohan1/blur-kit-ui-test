'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Mic, Radio, Link2, AlertTriangle } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

type NavPage = 'home' | 'cuegrid' | 'selector' | 'group' | 'player' | 'time' |
  'hub' | 'recording' | 'audio' | 'keybind' | 'timecode' | 'macro' | 'showfile' | 'docs' | 'info'

interface ProfileState {
  name: string
  key: string          // 25 chars, we show first 5 + last 5
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
    key: 'BLURX8K29F3M7Q1P4Z6W8L2NC', // 25 chars
    isLinked: true,
    isFlagged: false,
    isRecording: false,
    isAudioRunning: false,
  })

  return (
    <div className="h-screen w-screen flex flex-col bg-black relative overflow-hidden">
      {/* Animated background — subtle white orbs, slowly moving */}
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
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
// Animated Background — slow moving white orbs (Apple-style deference)
// ============================================================================

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{ background: 'rgba(255,255,255,0.025)' }}
        animate={{ x: ['-10%', '60%', '30%', '-10%'], y: ['-10%', '30%', '60%', '-10%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ background: 'rgba(255,255,255,0.02)' }}
        animate={{ x: ['80%', '20%', '50%', '80%'], y: ['60%', '20%', '40%', '60%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: 'rgba(255,255,255,0.015)' }}
        animate={{ x: ['40%', '10%', '70%', '40%'], y: ['70%', '40%', '20%', '70%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ============================================================================
// Floating Nav Bar — liquid glass, centered, gradient sweep
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
    <div className="px-4 pt-3 pb-2 relative z-20">
      <div className="liquid-glass rounded-2xl relative overflow-hidden">
        {/* White gradient sweep overlay */}
        <div className="absolute inset-0 navbar-gradient pointer-events-none rounded-2xl" />

        <div className="relative flex items-center gap-3 px-4 py-2">
          {/* Version — left */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-white/10 flex-shrink-0">
            <span className="text-sm font-bold tracking-tight text-white">Blur</span>
            <span className="text-[8px] text-neutral-600 font-mono">v3.9.6</span>
          </div>

          {/* Global buttons — CENTERED */}
          <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto nav-scroll">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => onPageChange(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Profile Badge — right */}
          <ProfileBadge
            profile={profile}
            onToggleRecording={onToggleRecording}
            onToggleAudio={onToggleAudio}
            onToggleLinked={onToggleLinked}
            onToggleFlagged={onToggleFlagged}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Profile Badge — compact, P icon + name only, key hidden
// ============================================================================

function maskKey(key: string): string {
  if (key.length <= 10) return key
  return key.substring(0, 5) + '•••••' + key.substring(key.length - 5)
}

function ProfileBadge({
  profile, onToggleRecording, onToggleAudio, onToggleLinked, onToggleFlagged,
}: {
  profile: ProfileState
  onToggleRecording: () => void
  onToggleAudio: () => void
  onToggleLinked: () => void
  onToggleFlagged: () => void
}) {
  // Status indicator on P icon
  let statusElement: React.ReactNode = null
  if (profile.isFlagged) {
    statusElement = <div className="w-2 h-2 rounded-full bg-yellow-400" style={{ animation: 'smoothBlink 1.5s ease-in-out infinite' }} />
  } else if (profile.isRecording && profile.isAudioRunning) {
    statusElement = <AlternateStatus />
  } else if (profile.isRecording) {
    statusElement = <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'smoothBlink 1.5s ease-in-out infinite' }} />
  } else if (profile.isAudioRunning) {
    statusElement = <Radio size={8} className="text-blue-400" style={{ animation: 'smoothPulse 1.2s ease-in-out infinite' }} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-all flex-shrink-0 border ${
            profile.isFlagged ? 'border-yellow-500/40' : 'border-white/10'
          } hover:bg-white/5`}
        >
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center bg-white/5">
            <span className="text-[11px] font-bold text-white">P</span>
            {statusElement && (
              <div className="absolute -top-0.5 -right-0.5 z-10">{statusElement}</div>
            )}
          </div>
          <span className="text-[10px] font-medium text-white">{profile.name}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${profile.isLinked ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-0 rounded-2xl liquid-glass-elevated border-white/10"
      >
        {/* Header — name + masked key */}
        <div className="flex items-center gap-3 p-3 pb-2">
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${
            profile.isFlagged ? 'border border-yellow-500/40' : ''
          }`}>
            <span className="text-sm font-bold text-white">P</span>
            {statusElement && (
              <div className="absolute -top-0.5 -right-0.5 z-10">{statusElement}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{profile.name}</p>
            <p className="text-[8px] text-neutral-600 font-mono">{maskKey(profile.key)}</p>
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
          <button onClick={onToggleRecording} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile.isRecording ? 'bg-red-500/20' : 'bg-white/5'}`}>
              {profile.isRecording ? (
                <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'smoothBlink 1.5s ease-in-out infinite' }} />
              ) : (
                <Mic size={10} className="text-neutral-600" />
              )}
            </div>
            <span className="text-[10px] text-white/80">Recording</span>
            <span className={`ml-auto text-[8px] font-medium ${profile.isRecording ? 'text-red-400' : 'text-neutral-700'}`}>
              {profile.isRecording ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Audio */}
          <button onClick={onToggleAudio} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile.isAudioRunning ? 'bg-blue-500/20' : 'bg-white/5'}`}>
              <Radio size={10} className={profile.isAudioRunning ? 'text-blue-400' : 'text-neutral-600'} style={profile.isAudioRunning ? { animation: 'smoothPulse 1.2s ease-in-out infinite' } : {}} />
            </div>
            <span className="text-[10px] text-white/80">Audio</span>
            <span className={`ml-auto text-[8px] font-medium ${profile.isAudioRunning ? 'text-blue-400' : 'text-neutral-700'}`}>
              {profile.isAudioRunning ? 'RUNNING' : 'IDLE'}
            </span>
          </button>

          {/* Connection */}
          <button onClick={onToggleLinked} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile.isLinked ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
              <Link2 size={10} className={profile.isLinked ? 'text-emerald-400' : 'text-neutral-600'} />
            </div>
            <span className="text-[10px] text-white/80">Connection</span>
            <span className={`ml-auto text-[8px] font-medium ${profile.isLinked ? 'text-emerald-400' : 'text-neutral-700'}`}>
              {profile.isLinked ? 'LINKED' : 'OFFLINE'}
            </span>
          </button>
        </div>

        <DropdownMenuSeparator className="bg-white/5" />

        <div className="p-2">
          <button onClick={onToggleFlagged} className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[8px] text-neutral-600 hover:text-yellow-400 transition-colors">
            <AlertTriangle size={10} />
            {profile.isFlagged ? 'Unflag Account' : 'Flag Account (demo)'}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Alternate Status — smooth transition between recording + audio
// ============================================================================

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
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
      ) : (
        <motion.div
          key="aud"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Radio size={8} className="text-blue-400" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// Home Page — Welcome → 5 rotating BLUR texts → version
// ============================================================================

function HomePage({ profile }: { profile: ProfileState }) {
  const [phase, setPhase] = useState<'welcome' | 'blur'>('welcome')

  useEffect(() => {
    const timer = setTimeout(() => setPhase('blur'), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      {/* Flagged warning (Home only) */}
      {profile.isFlagged && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 liquid-glass px-4 py-2 rounded-xl flex items-center gap-2"
          style={{ borderColor: 'rgba(255,200,0,0.2)' }}
        >
          <AlertTriangle size={12} className="text-yellow-400" />
          <span className="text-[10px] text-yellow-300">Your account has been flagged. Please contact an administrator.</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'welcome' ? (
          /* ─── Phase 1: Welcome [user] ─── */
          <motion.div
            key="welcome"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-center"
          >
            <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Welcome</p>
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
          </motion.div>
        ) : (
          /* ─── Phase 2: 5 rotating BLUR texts + version tag ─── */
          <motion.div
            key="blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center"
          >
            {/* 5 rotating BLUR texts — like the laser app */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    animation: `blurRotate ${20 + i * 4}s linear infinite`,
                    animationDelay: `${i * 0.8}s`,
                  }}
                >
                  <span
                    className="text-6xl font-bold tracking-tighter select-none"
                    style={{
                      color: i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      transform: `translateY(${i * 6 - 12}px)`,
                    }}
                  >
                    BLUR
                  </span>
                </div>
              ))}

              {/* Version tag below the rotating texts */}
              <div className="relative z-10 text-center">
                <p className="text-[10px] text-white/30 font-mono">Version 3.9.6</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${profile.isLinked ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                  <span className="text-[9px] text-white/40">{profile.isLinked ? 'Linked' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Placeholder page
// ============================================================================

function PlaceholderPage({ page }: { page: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="liquid-glass rounded-2xl p-8 text-center">
        <p className="text-sm text-white/60 capitalize">{page}</p>
        <p className="text-[10px] text-neutral-700 mt-1">This panel will be built next</p>
      </div>
    </div>
  )
}
