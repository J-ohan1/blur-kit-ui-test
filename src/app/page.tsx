'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Mic, Radio, Link2, AlertTriangle, ChevronRight, Search, Palette,
  Plus, Trash2, Play, Square, Settings, Layout, Zap, Clock,
  Grid3x3, List, Layers, Sliders, Terminal, Volume2,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type FixtureType = 'profile' | 'wash' | 'lasers' | 'follow_spot' | 'magic_panel' |
  'magic_blade' | 'led_line' | 'led_cube' | 'pars' | 'blinders' | 'display' |
  'atomic' | 'big_strobes' | 'q7' | 'jdc1' | 'pyrotech'

interface Fixture {
  id: string
  name: string
  number: number
  type: FixtureType
  channel: number
  dimmer: number
  color: string
  position: { pan: number; tilt: number }
  selected: boolean
}

interface PoolSlot {
  id: string
  label: string
  type: 'group' | 'preset' | 'effect' | 'macro' | 'sequence'
  refId: string
}

interface Executor {
  id: string
  label: string
  type: 'fader' | 'button'
  value: number      // 0-1 for faders
  active: boolean    // for buttons
  assigned: string | null  // sequence/effect ID
}

// ═══════════════════════════════════════════════════════════════
// FIXTURE TYPE DEFINITIONS — encoder parameters per type
// ═══════════════════════════════════════════════════════════════

const FIXTURE_PARAMS: Record<FixtureType, { label: string; params: string[] }> = {
  profile: { label: 'Profile', params: ['Dimmer', 'Pan', 'Tilt', 'Color', 'Gobo', 'Strobe'] },
  wash: { label: 'Wash', params: ['Dimmer', 'Pan', 'Tilt', 'Color', 'Zoom'] },
  lasers: { label: 'Laser', params: ['Dimmer', 'Pan', 'Tilt', 'Spin', 'Width', 'Color'] },
  follow_spot: { label: 'Follow Spot', params: ['Dimmer', 'Color', 'Zoom', 'Iris'] },
  magic_panel: { label: 'Magic Panel', params: ['Dimmer', 'Color', 'Pattern', 'Speed'] },
  magic_blade: { label: 'Magic Blade', params: ['Dimmer', 'Color', 'Tilt', 'Speed'] },
  led_line: { label: 'LED Line', params: ['Dimmer', 'Color', 'Pattern', 'Speed'] },
  led_cube: { label: 'LED Cube', params: ['Dimmer', 'Color', 'Pattern', 'Speed'] },
  pars: { label: 'Par', params: ['Dimmer', 'Color'] },
  blinders: { label: 'Blinder', params: ['Dimmer', 'Color'] },
  display: { label: 'Display', params: ['Content', 'Brightness'] },
  atomic: { label: 'Atomic', params: ['Rate', 'Intensity', 'Duration'] },
  big_strobes: { label: 'Big Strobe', params: ['Rate', 'Intensity'] },
  q7: { label: 'Q7', params: ['Dimmer', 'Tilt', 'Color'] },
  jdc1: { label: 'JDC1', params: ['Dimmer', 'Color', 'Strobe', 'Tilt'] },
  pyrotech: { label: 'Pyro', params: ['Trigger', 'Color'] },
}

const FIXTURE_COLORS: Record<FixtureType, string> = {
  profile: '#8b5cf6', wash: '#3b82f6', lasers: '#ef4444', follow_spot: '#f59e0b',
  magic_panel: '#ec4899', magic_blade: '#ec4899', led_line: '#10b981', led_cube: '#10b981',
  pars: '#06b6d4', blinders: '#f97316', display: '#8b5cf6', atomic: '#ef4444',
  big_strobes: '#ef4444', q7: '#ffffff', jdc1: '#22d3ee', pyrotech: '#fbbf24',
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

function generateFixtures(): Fixture[] {
  const fixtures: Fixture[] = []
  const types: FixtureType[] = ['q7', 'q7', 'q7', 'q7', 'q7', 'q7', 'q7', 'q7',
    'lasers', 'lasers', 'lasers', 'lasers', 'profile', 'profile', 'profile', 'profile',
    'wash', 'wash', 'wash', 'wash', 'blinders', 'blinders', 'blinders', 'blinders',
    'atomic', 'big_strobes', 'pyrotech', 'jdc1', 'jdc1', 'magic_panel', 'led_line', 'led_line']
  types.forEach((type, i) => {
    fixtures.push({
      id: `fix-${i + 1}`,
      name: `${FIXTURE_PARAMS[type].label} ${i + 1}`,
      number: i + 1,
      type,
      channel: i + 1,
      dimmer: Math.random() > 0.5 ? Math.random() : 0,
      color: ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#ff00ff', '#ffff00'][i % 6],
      position: { pan: Math.random(), tilt: Math.random() },
      selected: false,
    })
  })
  return fixtures
}

const POOL_TABS = [
  { id: 'groups', label: 'Groups', icon: Layers },
  { id: 'presets', label: 'Presets', icon: Palette },
  { id: 'effects', label: 'Effects', icon: Zap },
  { id: 'macros', label: 'Macros', icon: Terminal },
  { id: 'sequences', label: 'Sequences', icon: List },
] as const

// ═══════════════════════════════════════════════════════════════
// MAIN APP — grandMA3-style workspace
// ═══════════════════════════════════════════════════════════════

export default function BlurKitConsole() {
  const [fixtures, setFixtures] = useState<Fixture[]>(generateFixtures)
  const [activePool, setActivePool] = useState<string>('groups')
  const [activeView, setActiveView] = useState<string>('fixture_sheet')
  const [commandText, setCommandText] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [executors, setExecutors] = useState<Executor[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: `exec-${i + 1}`,
      label: `Exec ${i + 1}`,
      type: i < 6 ? 'fader' : 'button',
      value: 0,
      active: false,
      assigned: i < 3 ? `seq-${i + 1}` : null,
    }))
  )

  // Selected fixtures
  const selectedFixtures = fixtures.filter(f => f.selected)
  const selectedType = selectedFixtures[0]?.type || 'q7'
  const selectedParams = FIXTURE_PARAMS[selectedType]?.params || ['Dimmer']

  // Toggle fixture selection
  const toggleFixture = useCallback((id: string) => {
    setFixtures(prev => prev.map(f => f => f.id === id ? { ...f, selected: !f.selected } : f))
  }, [])

  // Select all of a type
  const selectByType = useCallback((type: FixtureType) => {
    setFixtures(prev => prev.map(f => f => f.type === type ? { ...f, selected: true } : { ...f, selected: false }))
  }, [])

  // Command line execution
  const executeCommand = useCallback(() => {
    if (!commandText.trim()) return
    setCommandHistory(prev => [...prev, `> ${commandText}`])
    // Parse simple commands
    const cmd = commandText.toLowerCase()
    if (cmd.includes('select') && cmd.includes('all')) {
      setFixtures(prev => prev.map(f => ({ ...f, selected: true })))
      setCommandHistory(prev => [...prev, '✓ Selected all fixtures'])
    } else if (cmd.includes('clear')) {
      setFixtures(prev => prev.map(f => ({ ...f, selected: false })))
      setCommandHistory(prev => [...prev, '✓ Cleared selection'])
    } else if (cmd.includes('select') && cmd.includes('group')) {
      const match = cmd.match(/group\s+(\d+)/)
      if (match) {
        setFixtures(prev => prev.map(f => f => f.number <= parseInt(match[1]) ? { ...f, selected: true } : { ...f, selected: false }))
        setCommandHistory(prev => [...prev, `✓ Selected group ${match[1]}`])
      }
    } else if (cmd.includes('at') && cmd.includes('full')) {
      setFixtures(prev => prev.map(f => f => f.selected ? { ...f, dimmer: 1 } : f))
      setCommandHistory(prev => [...prev, '✓ Selected fixtures at full'])
    } else if (cmd.includes('at') && cmd.includes('out') || cmd.includes('off')) {
      setFixtures(prev => prev.map(f => f => f.selected ? { ...f, dimmer: 0 } : f))
      setCommandHistory(prev => [...prev, '✓ Selected fixtures off'])
    } else {
      setCommandHistory(prev => [...prev, `✗ Unknown command: ${commandText}`])
    }
    setCommandText('')
  }, [commandText])

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* ─── MENU BAR ─── */}
      <MenuBar selectedFixtures={selectedFixtures.length} />

      {/* ─── MAIN WORKSPACE ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* POOL SIDEBAR (left) */}
        <PoolSidebar
          activePool={activePool}
          onPoolChange={setActivePool}
          fixtures={fixtures}
        />

        {/* VIEW AREA (center) */}
        <ViewArea
          fixtures={fixtures}
          activeView={activeView}
          onViewChange={setActiveView}
          onToggleFixture={toggleFixture}
          onSelectByType={selectByType}
        />

        {/* ENCODER BAR (right) */}
        <EncoderBar
          params={selectedParams}
          fixtureType={selectedType}
          selectedCount={selectedFixtures.length}
          fixtures={selectedFixtures}
        />
      </div>

      {/* ─── COMMAND LINE ─── */}
      <CommandLine
        value={commandText}
        onChange={setCommandText}
        onExecute={executeCommand}
        history={commandHistory}
      />

      {/* ─── EXECUTOR BAR ─── */}
      <ExecutorBar
        executors={executors}
        onExecutorChange={(id, changes) => setExecutors(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e))}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MENU BAR — top navigation
// ═══════════════════════════════════════════════════════════════

function MenuBar({ selectedFixtures }: { selectedFixtures: number }) {
  const [activeMenu, setActiveMenu] = useState('home')

  const menus = [
    { id: 'home', label: 'Home' },
    { id: 'setup', label: 'Setup' },
    { id: 'patch', label: 'Patch' },
    { id: 'layout', label: 'Layout' },
    { id: 'sequence', label: 'Sequence' },
    { id: 'tools', label: 'Tools' },
  ]

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.06]"
      style={{ background: 'rgba(18,18,18,0.8)', backdropFilter: 'blur(30px)' }}>
      {/* App name */}
      <div className="flex items-center gap-2 pr-3 mr-1 border-r border-white/10">
        <span className="text-sm font-bold tracking-tight">Blur</span>
        <span className="text-[8px] text-white/30 font-mono">v4.0.0</span>
      </div>

      {/* Menu items */}
      <div className="flex items-center gap-0.5">
        {menus.map(m => (
          <button key={m.id} onClick={() => setActiveMenu(m.id)}
            className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
              activeMenu === m.id ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Selection count */}
      {selectedFixtures > 0 && (
        <Badge variant="outline" className="mr-2 text-[9px] border-white/20 text-white/60 bg-white/5">
          {selectedFixtures} selected
        </Badge>
      )}

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-white/10 hover:bg-white/5 transition-all">
            <Avatar className="w-6 h-6 rounded-full bg-white/10">
              <AvatarFallback className="bg-transparent text-[10px] font-bold">P</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium text-white">Kinsoaki</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl border-white/10"
          style={{ background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(40px)' }}>
          <div className="px-3 py-2">
            <p className="text-[12px] font-semibold text-white">Kinsoaki</p>
            <p className="text-[8px] text-white/30 font-mono">BLURX•••••L2NC</p>
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="text-[10px] text-white/60 cursor-pointer">Settings</DropdownMenuItem>
          <DropdownMenuItem className="text-[10px] text-white/60 cursor-pointer">Showfile</DropdownMenuItem>
          <DropdownMenuItem className="text-[10px] text-white/60 cursor-pointer">About Blur</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// POOL SIDEBAR — left, grid of slots (MA3 pool style)
// ═══════════════════════════════════════════════════════════════

function PoolSidebar({
  activePool, onPoolChange, fixtures,
}: {
  activePool: string
  onPoolChange: (pool: string) => void
  fixtures: Fixture[]
}) {
  // Generate pool data
  const poolData: Record<string, PoolSlot[]> = {
    groups: [
      { id: 'g1', label: 'All Q7', type: 'group', refId: 'q7' },
      { id: 'g2', label: 'All Lasers', type: 'group', refId: 'lasers' },
      { id: 'g3', label: 'All Profiles', type: 'group', refId: 'profile' },
      { id: 'g4', label: 'All Wash', type: 'group', refId: 'wash' },
      { id: 'g5', label: 'All Blinders', type: 'group', refId: 'blinders' },
      { id: 'g6', label: 'Front Row', type: 'group', refId: 'front' },
      { id: 'g7', label: 'Back Row', type: 'group', refId: 'back' },
      { id: 'g8', label: 'Left Side', type: 'group', refId: 'left' },
      { id: 'g9', label: 'Right Side', type: 'group', refId: 'right' },
      { id: 'g10', label: 'Pyro', type: 'group', refId: 'pyro' },
      { id: 'g11', label: 'Strobes', type: 'group', refId: 'strobe' },
      { id: 'g12', label: 'JDC1', type: 'group', refId: 'jdc1' },
    ],
    presets: [
      { id: 'p1', label: 'Red', type: 'preset', refId: 'red' },
      { id: 'p2', label: 'Blue', type: 'preset', refId: 'blue' },
      { id: 'p3', label: 'Green', type: 'preset', refId: 'green' },
      { id: 'p4', label: 'White', type: 'preset', refId: 'white' },
      { id: 'p5', label: 'Magenta', type: 'preset', refId: 'magenta' },
      { id: 'p6', label: 'Cyan', type: 'preset', refId: 'cyan' },
      { id: 'p7', label: 'Amber', type: 'preset', refId: 'amber' },
      { id: 'p8', label: 'UV', type: 'preset', refId: 'uv' },
      { id: 'p9', label: 'Pos Up', type: 'preset', refId: 'up' },
      { id: 'p10', label: 'Pos Mid', type: 'preset', refId: 'mid' },
      { id: 'p11', label: 'Pos Down', type: 'preset', refId: 'down' },
      { id: 'p12', label: 'Pos Fan', type: 'preset', refId: 'fan' },
    ],
    effects: [
      { id: 'e1', label: 'Chase →', type: 'effect', refId: 'chase-r' },
      { id: 'e2', label: 'Chase ←', type: 'effect', refId: 'chase-l' },
      { id: 'e3', label: 'Sine →', type: 'effect', refId: 'sine-r' },
      { id: 'e4', label: 'Sine ←', type: 'effect', refId: 'sine-l' },
      { id: 'e5', label: 'Pulse', type: 'effect', refId: 'pulse' },
      { id: 'e6', label: 'Strobe', type: 'effect', refId: 'strobe' },
      { id: 'e7', label: 'Rainbow', type: 'effect', refId: 'rainbow' },
      { id: 'e8', label: 'Fan Out', type: 'effect', refId: 'fan-out' },
      { id: 'e9', label: 'Breathe', type: 'effect', refId: 'breathe' },
      { id: 'e10', label: 'Bump →', type: 'effect', refId: 'bump-r' },
      { id: 'e11', label: 'E/O Flash', type: 'effect', refId: 'evenodd' },
      { id: 'e12', label: 'PWM Chase', type: 'effect', refId: 'pwm' },
    ],
    macros: [
      { id: 'm1', label: 'Intro', type: 'macro', refId: 'intro' },
      { id: 'm2', label: 'Verse', type: 'macro', refId: 'verse' },
      { id: 'm3', label: 'Build', type: 'macro', refId: 'build' },
      { id: 'm4', label: 'Drop', type: 'macro', refId: 'drop' },
      { id: 'm5', label: 'Break', type: 'macro', refId: 'break' },
      { id: 'm6', label: 'Outro', type: 'macro', refId: 'outro' },
    ],
    sequences: [
      { id: 's1', label: 'Show Intro', type: 'sequence', refId: 'show-intro' },
      { id: 's2', label: 'Color Chase', type: 'sequence', refId: 'color-chase' },
      { id: 's3', label: 'Strobe Show', type: 'sequence', refId: 'strobe-show' },
      { id: 's4', label: 'Pyro Show', type: 'sequence', refId: 'pyro-show' },
    ],
  }

  const slots = poolData[activePool] || []

  return (
    <div className="w-48 flex-shrink-0 flex flex-col border-r border-white/[0.06]"
      style={{ background: 'rgba(12,12,12,0.6)' }}>
      {/* Pool tabs */}
      <div className="flex flex-col gap-0.5 p-1.5 border-b border-white/[0.06]">
        {POOL_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => onPoolChange(tab.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                activePool === tab.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
              }`}>
              <Icon size={11} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Pool grid */}
      <ScrollArea className="flex-1">
        <div className="p-2 grid grid-cols-2 gap-1.5">
          {slots.map((slot, i) => (
            <button key={slot.id}
              className="aspect-square rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all flex flex-col items-center justify-center gap-1 group"
              title={slot.label}>
              <span className="text-[8px] text-white/30 font-mono absolute top-1 left-1.5">{i + 1}</span>
              <div className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: `${FIXTURE_COLORS[slot.refId as FixtureType] || '#666'}20` }}>
                <span className="text-[9px] font-bold"
                  style={{ color: FIXTURE_COLORS[slot.refId as FixtureType] || '#666' }}>
                  {slot.label.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[8px] text-white/50 text-center px-1 truncate max-w-full">{slot.label}</span>
            </button>
          ))}
          {/* Empty slot for adding new */}
          <button className="aspect-square rounded-lg border border-dashed border-white/[0.06] hover:border-white/20 flex items-center justify-center transition-all">
            <Plus size={12} className="text-white/20" />
          </button>
        </div>
      </ScrollArea>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIEW AREA — center, tabbed views
// ═══════════════════════════════════════════════════════════════

function ViewArea({
  fixtures, activeView, onViewChange, onToggleFixture, onSelectByType,
}: {
  fixtures: Fixture[]
  activeView: string
  onViewChange: (v: string) => void
  onToggleFixture: (id: string) => void
  onSelectByType: (type: FixtureType) => void
}) {
  const views = [
    { id: 'fixture_sheet', label: 'Fixture Sheet', icon: List },
    { id: 'grid', label: 'Grid', icon: Grid3x3 },
    { id: '3d', label: '3D Stage', icon: Layout },
    { id: 'cue_list', label: 'Cue List', icon: Clock },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* View tabs */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/[0.06]"
        style={{ background: 'rgba(15,15,15,0.6)' }}>
        {views.map(v => {
          const Icon = v.icon
          return (
            <button key={v.id} onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                activeView === v.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}>
              <Icon size={11} />
              {v.label}
            </button>
          )
        })}
        <div className="flex-1" />
        {/* Fixture type quick-select */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-white/30 mr-1">Select:</span>
          {(Object.keys(FIXTURE_PARAMS) as FixtureType[]).slice(0, 6).map(type => (
            <button key={type} onClick={() => onSelectByType(type)}
              className="px-1.5 py-0.5 rounded text-[8px] font-medium border border-white/10 hover:bg-white/5 transition-all"
              style={{ color: FIXTURE_COLORS[type] }}>
              {FIXTURE_PARAMS[type].label}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeView}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full">
            {activeView === 'fixture_sheet' && <FixtureSheet fixtures={fixtures} onToggle={onToggleFixture} />}
            {activeView === 'grid' && <GridView fixtures={fixtures} onToggle={onToggleFixture} />}
            {activeView === '3d' && <StageView fixtures={fixtures} />}
            {activeView === 'cue_list' && <CueListView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// FIXTURE SHEET — spreadsheet of all fixtures + values (MA3 style)
// ═══════════════════════════════════════════════════════════════

function FixtureSheet({ fixtures, onToggle }: { fixtures: Fixture[]; onToggle: (id: string) => void }) {
  return (
    <ScrollArea className="h-full">
      <table className="w-full text-[10px]">
        <thead className="sticky top-0 z-10">
          <tr style={{ background: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(20px)' }}>
            <th className="text-left px-2 py-1.5 font-medium text-white/40 border-b border-white/10 w-8">#</th>
            <th className="text-left px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Name</th>
            <th className="text-left px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Type</th>
            <th className="text-center px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Ch</th>
            <th className="text-center px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Dim</th>
            <th className="text-center px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Color</th>
            <th className="text-center px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Pan</th>
            <th className="text-center px-2 py-1.5 font-medium text-white/40 border-b border-white/10">Tilt</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map(f => (
            <tr key={f.id} onClick={() => onToggle(f.id)}
              className={`cursor-pointer transition-colors ${
                f.selected ? 'bg-white/10' : 'hover:bg-white/[0.03]'
              }`}>
              <td className="px-2 py-1.5 text-white/30 font-mono border-b border-white/[0.04]">{f.number}</td>
              <td className="px-2 py-1.5 text-white/80 border-b border-white/[0.04]">{f.name}</td>
              <td className="px-2 py-1.5 border-b border-white/[0.04]">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-medium"
                  style={{ color: FIXTURE_COLORS[f.type], background: `${FIXTURE_COLORS[f.type]}15` }}>
                  {FIXTURE_PARAMS[f.type].label}
                </span>
              </td>
              <td className="px-2 py-1.5 text-center text-white/40 font-mono border-b border-white/[0.04]">{f.channel}</td>
              <td className="px-2 py-1.5 text-center border-b border-white/[0.04]">
                <div className="flex items-center gap-1.5 justify-center">
                  <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.dimmer * 100}%`, background: f.dimmer > 0 ? f.color : '#333' }} />
                  </div>
                  <span className="text-[8px] text-white/40 font-mono w-6">{Math.round(f.dimmer * 100)}</span>
                </div>
              </td>
              <td className="px-2 py-1.5 text-center border-b border-white/[0.04]">
                <div className="w-4 h-4 rounded-full mx-auto" style={{ background: f.color, opacity: f.dimmer > 0 ? 1 : 0.3 }} />
              </td>
              <td className="px-2 py-1.5 text-center text-white/40 font-mono border-b border-white/[0.04]">{Math.round(f.position.pan * 360)}°</td>
              <td className="px-2 py-1.5 text-center text-white/40 font-mono border-b border-white/[0.04]">{Math.round(f.position.tilt * 270)}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}

// ═══════════════════════════════════════════════════════════════
// GRID VIEW — 2D grid of fixture buttons
// ═══════════════════════════════════════════════════════════════

function GridView({ fixtures, onToggle }: { fixtures: Fixture[]; onToggle: (id: string) => void }) {
  const cols = Math.ceil(Math.sqrt(fixtures.length))
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="grid gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 56}px` }}>
          {fixtures.map(f => (
            <button key={f.id} onClick={() => onToggle(f.id)}
              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                f.selected ? 'border-white bg-white/10' : 'border-white/10 bg-white/[0.02] hover:border-white/30'
              }`}
              style={f.dimmer > 0 ? { boxShadow: `inset 0 0 12px ${f.color}40` } : undefined}>
              <span className="text-[8px] font-bold text-white/40 tabular-nums">{f.number}</span>
              {f.dimmer > 0 && (
                <div className="w-4 h-4 rounded-full" style={{ background: f.color, opacity: f.dimmer }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

// ═══════════════════════════════════════════════════════════════
// STAGE VIEW — 3D placeholder
// ═══════════════════════════════════════════════════════════════

function StageView({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Layout size={32} className="text-white/10 mx-auto mb-2" />
        <p className="text-[11px] text-white/30">3D Stage View</p>
        <p className="text-[9px] text-white/20 mt-1">{fixtures.length} fixtures loaded</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CUE LIST VIEW
// ═══════════════════════════════════════════════════════════════

function CueListView() {
  const cues = [
    { num: 1, name: 'Intro — All On Red', time: '0:00', fade: '2.0s' },
    { num: 2, name: 'Verse — Front Q7 Blue', time: '0:32', fade: '1.5s' },
    { num: 3, name: 'Build — Chase →', time: '1:15', fade: '0.5s' },
    { num: 4, name: 'Drop — Full Strobe', time: '1:45', fade: '0.0s' },
    { num: 5, name: 'Break — Dark', time: '2:10', fade: '1.0s' },
    { num: 6, name: 'Outro — Fade Out', time: '3:00', fade: '3.0s' },
  ]
  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {cues.map(cue => (
          <div key={cue.num} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <span className="text-[10px] font-bold text-white/30 font-mono w-6">{cue.num}</span>
            <div className="flex-1">
              <p className="text-[11px] text-white/80">{cue.name}</p>
              <p className="text-[8px] text-white/30 font-mono">{cue.time} · fade {cue.fade}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={12} className="text-white/40 hover:text-white" />
            </button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// ═══════════════════════════════════════════════════════════════
// ENCODER BAR — context-sensitive parameter knobs (MA3 signature)
// ═══════════════════════════════════════════════════════════════

function EncoderBar({
  params, fixtureType, selectedCount, fixtures,
}: {
  params: string[]
  fixtureType: FixtureType
  selectedCount: number
  fixtures: Fixture[]
}) {
  const [values, setValues] = useState<Record<string, number>>({})
  const fixtureLabel = FIXTURE_PARAMS[fixtureType]?.label || 'None'

  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-l border-white/[0.06]"
      style={{ background: 'rgba(12,12,12,0.6)' }}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <p className="text-[8px] uppercase tracking-wider text-white/30 font-semibold">Encoders</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: FIXTURE_COLORS[fixtureType] }} />
          <span className="text-[10px] font-medium text-white/80">{fixtureLabel}</span>
          <span className="text-[8px] text-white/30 ml-auto">{selectedCount} sel</span>
        </div>
      </div>

      {/* Encoder knobs */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {params.map(param => {
            const val = values[param] ?? fixtures[0]?.dimmer ?? 0
            return (
              <div key={param}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-medium text-white/60">{param}</span>
                  <span className="text-[8px] text-white/30 font-mono">{Math.round(val * 100)}</span>
                </div>
                {/* Encoder visual — circular knob */}
                <div className="relative h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                    <circle cx="24" cy="24" r="20" fill="none"
                      stroke={FIXTURE_COLORS[fixtureType]} strokeWidth="2"
                      strokeDasharray={`${val * 125.6} 125.6`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.2s ease' }} />
                  </svg>
                  <div className="absolute w-2 h-2 rounded-full" style={{ background: FIXTURE_COLORS[fixtureType], opacity: val > 0 ? 1 : 0.3 }} />
                </div>
                {/* Encoder slider */}
                <input type="range" min={0} max={1} step={0.01} value={val}
                  onChange={e => setValues(prev => ({ ...prev, [param]: parseFloat(e.target.value) }))}
                  className="w-full h-1 accent-white"
                  style={{ accentColor: FIXTURE_COLORS[fixtureType] }} />
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      <div className="p-2 border-t border-white/[0.06] flex gap-1">
        <Button size="sm" variant="outline" className="flex-1 h-7 text-[9px] border-white/10 bg-white/5">Full</Button>
        <Button size="sm" variant="outline" className="flex-1 h-7 text-[9px] border-white/10 bg-white/5">Zero</Button>
        <Button size="sm" variant="outline" className="flex-1 h-7 text-[9px] border-white/10 bg-white/5">Clear</Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMMAND LINE — text input (MA3 style)
// ═══════════════════════════════════════════════════════════════

function CommandLine({
  value, onChange, onExecute, history,
}: {
  value: string
  onChange: (v: string) => void
  onExecute: () => void
  history: string[]
}) {
  return (
    <div className="border-t border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.8)' }}>
      {/* History */}
      <div className="h-16 overflow-y-auto px-3 py-1 font-mono text-[9px]">
        {history.slice(-5).map((line, i) => (
          <div key={i} className={line.startsWith('✓') ? 'text-emerald-400/60' : line.startsWith('✗') ? 'text-red-400/60' : 'text-white/30'}>
            {line}
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/[0.04]">
        <ChevronRight size={12} className="text-white/30" />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onExecute() }}
          placeholder="Enter command... (e.g. 'select all', 'select group 5', 'at full', 'at out')"
          className="flex-1 bg-transparent text-[11px] text-white font-mono outline-none placeholder:text-white/20"
        />
        <Badge variant="outline" className="text-[7px] border-white/10 text-white/30">ENTER</Badge>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// EXECUTOR BAR — bottom faders + buttons (MA3 style)
// ═══════════════════════════════════════════════════════════════

function ExecutorBar({
  executors, onExecutorChange,
}: {
  executors: Executor[]
  onExecutorChange: (id: string, changes: Partial<Executor>) => void
}) {
  return (
    <div className="flex items-stretch gap-1 px-2 py-1.5 border-t border-white/[0.06]"
      style={{ background: 'rgba(15,15,15,0.8)' }}>
      {executors.map(exec => (
        <div key={exec.id} className="flex-1 min-w-0 flex flex-col items-center gap-1">
          {/* Label */}
          <span className="text-[7px] text-white/30 font-mono truncate w-full text-center">{exec.label}</span>

          {exec.type === 'fader' ? (
            <>
              {/* Go button */}
              <button onClick={() => onExecutorChange(exec.id, { active: !exec.active })}
                className={`w-full h-5 rounded text-[8px] font-bold transition-all ${
                  exec.active ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}>
                GO
              </button>
              {/* Fader */}
              <div className="w-full h-12 relative bg-white/[0.03] rounded-md overflow-hidden cursor-pointer"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const val = 1 - (e.clientY - rect.top) / rect.height
                  onExecutorChange(exec.id, { value: Math.max(0, Math.min(1, val)) })
                }}>
                <div className="absolute bottom-0 left-0 right-0 transition-all"
                  style={{ height: `${exec.value * 100}%`, background: exec.value > 0 ? 'rgba(255,255,255,0.15)' : 'transparent' }} />
                <div className="absolute left-0 right-0 h-1 bg-white/40 rounded-full"
                  style={{ bottom: `${exec.value * 100}%`, transform: 'translateY(50%)' }} />
              </div>
              {/* Value */}
              <span className="text-[7px] text-white/30 font-mono">{Math.round(exec.value * 100)}</span>
            </>
          ) : (
            <>
              {/* Button */}
              <button onClick={() => onExecutorChange(exec.id, { active: !exec.active })}
                className={`w-full h-16 rounded-md text-[8px] font-medium transition-all ${
                  exec.active ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'
                }`}>
                {exec.assigned ? 'FLASH' : '—'}
              </button>
              <span className="text-[7px] text-white/30">{exec.assigned ? '✓' : ''}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
