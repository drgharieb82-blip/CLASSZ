/**
 * CLASSZ Character & Illustration System
 *
 * Inline SVG characters for Teen Mode.
 * These are additive layers — they never replace existing UI.
 * Adult Mode shows nothing (returns null).
 */

import { useIsTeenMode } from "@/lib/stores/visual-mode-store";
import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-24 w-24", md: "h-36 w-36", lg: "h-48 w-48" };

function TeenOnly({ children, className }: { children: React.ReactNode; className?: string }) {
  const isTeen = useIsTeenMode();
  if (!isTeen) return null;
  return <div className={cn("pointer-events-none select-none", className)}>{children}</div>;
}

export function ChemistryBoy({ className, size = "md" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 120 120" className={sizes[size]} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lab coat body */}
        <ellipse cx="60" cy="95" rx="28" ry="20" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="60" cy="42" r="22" fill="#fbbf24" opacity="0.15" />
        <circle cx="60" cy="42" r="20" fill="#fef3c7" />
        {/* Hair */}
        <path d="M40 38c0-12 8-20 20-20s20 8 20 20" fill="#1e293b" />
        {/* Goggles */}
        <rect x="45" y="36" width="12" height="9" rx="4" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
        <rect x="63" y="36" width="12" height="9" rx="4" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="57" y1="40" x2="63" y2="40" stroke="#3b82f6" strokeWidth="1.5" />
        {/* Smile */}
        <path d="M53 50c3 4 11 4 14 0" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Flask */}
        <path d="M85 70l-5 20h-10l-5-20z" fill="#8b5cf6" opacity="0.3" stroke="#8b5cf6" strokeWidth="1.5" />
        <circle cx="78" cy="82" r="3" fill="#a78bfa" />
        <circle cx="73" cy="85" r="2" fill="#c4b5fd" />
        {/* Bubbles */}
        <circle cx="82" cy="62" r="3" fill="#8b5cf6" opacity="0.4" />
        <circle cx="88" cy="55" r="2" fill="#a78bfa" opacity="0.5" />
        <circle cx="85" cy="48" r="1.5" fill="#c4b5fd" opacity="0.6" />
        {/* Stars */}
        <path d="M25 25l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#fbbf24" opacity="0.7" />
        <path d="M100 30l1.5 3 3 .8-2 2 .7 3-3-1.5-3 1.5.7-3-2-2 3-.8z" fill="#fbbf24" opacity="0.5" />
      </svg>
    </TeenOnly>
  );
}

export function StudyGirl({ className, size = "md" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 120 120" className={sizes[size]} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="60" cy="95" rx="26" ry="18" fill="#06b6d4" opacity="0.15" />
        <ellipse cx="60" cy="95" rx="24" ry="16" fill="#ecfeff" stroke="#06b6d4" strokeWidth="1" />
        {/* Head */}
        <circle cx="60" cy="42" r="20" fill="#fef3c7" />
        {/* Hijab */}
        <path d="M38 42c0-14 10-24 22-24s22 10 22 24c0 4-2 8-4 10-3-2-8-3-18-3s-15 1-18 3c-2-2-4-6-4-10z" fill="#ec4899" opacity="0.2" />
        <path d="M40 45c-2 5-2 10 0 15 4 2 12 3 20 3s16-1 20-3c2-5 2-10 0-15" fill="#ec4899" opacity="0.15" />
        {/* Eyes */}
        <circle cx="53" cy="42" r="2.5" fill="#1e293b" />
        <circle cx="67" cy="42" r="2.5" fill="#1e293b" />
        <circle cx="54" cy="41" r="1" fill="white" />
        <circle cx="68" cy="41" r="1" fill="white" />
        {/* Smile */}
        <path d="M54 50c2.5 3 9 3 12 0" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Tablet */}
        <rect x="30" y="68" width="20" height="28" rx="3" fill="#1e293b" />
        <rect x="32" y="70" width="16" height="22" rx="2" fill="#3b82f6" opacity="0.3" />
        {/* Molecules */}
        <circle cx="92" cy="50" r="4" fill="#06b6d4" opacity="0.4" />
        <circle cx="100" cy="58" r="3" fill="#06b6d4" opacity="0.3" />
        <line x1="95" y1="53" x2="98" y2="56" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
        <circle cx="88" cy="62" r="2.5" fill="#ec4899" opacity="0.3" />
        {/* Stars */}
        <path d="M20 60l1.5 3 3 .7-2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2-2 3-.7z" fill="#fbbf24" opacity="0.6" />
        <path d="M105 35l1 2 2 .5-1.5 1.5.4 2-2-1-2 1 .4-2-1.5-1.5 2-.5z" fill="#fbbf24" opacity="0.5" />
      </svg>
    </TeenOnly>
  );
}

export function EmptyBookshelf({ className, size = "lg" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 160 120" className={cn(sizes[size], "!w-auto")} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bookshelf */}
        <rect x="30" y="30" width="100" height="80" rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="30" y1="55" x2="130" y2="55" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="30" y1="80" x2="130" y2="80" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Single book */}
        <rect x="55" y="60" width="8" height="18" rx="1" fill="#8b5cf6" opacity="0.6" />
        {/* Boy */}
        <circle cx="45" cy="15" r="10" fill="#fef3c7" />
        <path d="M36 12c0-6 4-10 9-10s9 4 9 10" fill="#1e293b" />
        <circle cx="42" cy="15" r="1.5" fill="#1e293b" />
        <circle cx="48" cy="15" r="1.5" fill="#1e293b" />
        <path d="M42 19c1.5 2 5 2 6 0" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
        {/* Girl */}
        <circle cx="115" cy="15" r="10" fill="#fef3c7" />
        <path d="M105 10c0-5 5-9 10-9s10 4 10 9" fill="#7c3aed" opacity="0.3" />
        <circle cx="112" cy="15" r="1.5" fill="#1e293b" />
        <circle cx="118" cy="15" r="1.5" fill="#1e293b" />
        <path d="M112 19c1.5 2 5 2 6 0" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
        {/* Question marks */}
        <text x="75" y="48" fontSize="14" fill="#94a3b8" textAnchor="middle">?</text>
        <text x="95" y="73" fontSize="10" fill="#94a3b8" textAnchor="middle">?</text>
        {/* Sparkle */}
        <path d="M140 25l1.5 3 3 .7-2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2-2 3-.7z" fill="#fbbf24" opacity="0.6" />
      </svg>
    </TeenOnly>
  );
}

export function WalletCharacter({ className, size = "md" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 120 120" className={sizes[size]} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="50" cy="95" rx="22" ry="16" fill="#3b82f6" opacity="0.1" />
        {/* Head */}
        <circle cx="50" cy="45" r="18" fill="#fef3c7" />
        <path d="M34 40c0-10 7-18 16-18s16 8 16 18" fill="#1e293b" />
        <circle cx="45" cy="45" r="2" fill="#1e293b" />
        <circle cx="55" cy="45" r="2" fill="#1e293b" />
        <path d="M45 52c2 2.5 7 2.5 10 0" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Card in hand */}
        <rect x="65" y="55" width="35" height="22" rx="4" fill="url(#cardGrad)" />
        <rect x="69" y="60" width="14" height="3" rx="1" fill="white" opacity="0.5" />
        <circle cx="92" cy="70" r="4" fill="white" opacity="0.3" />
        {/* Coins */}
        <circle cx="95" cy="35" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="95" y="39" fontSize="8" fill="#92400e" textAnchor="middle" fontWeight="bold">$</text>
        <circle cx="108" cy="45" r="6" fill="#fbbf24" opacity="0.7" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="85" cy="28" r="5" fill="#fbbf24" opacity="0.5" stroke="#f59e0b" strokeWidth="1" />
        {/* Sparkles */}
        <path d="M20 30l1.5 3 3 .7-2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2-2 3-.7z" fill="#fbbf24" opacity="0.7" />
        <path d="M75 15l1 2 2.5 .5-1.5 1.5.4 2.5-2-1.2-2 1.2.4-2.5-1.5-1.5 2.5-.5z" fill="#8b5cf6" opacity="0.5" />
        <defs>
          <linearGradient id="cardGrad" x1="65" y1="55" x2="100" y2="77">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </TeenOnly>
  );
}

export function VictoryScene({ className, size = "lg" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 140 120" className={cn(sizes[size], "!w-auto")} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Trophy */}
        <path d="M60 50h20v10c0 8-4 14-10 14s-10-6-10-14z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
        <rect x="65" y="74" width="10" height="8" fill="#f59e0b" />
        <rect x="60" y="82" width="20" height="4" rx="2" fill="#92400e" />
        <path d="M56 50h-6c0 8 4 12 10 12v-4c-3 0-4-3-4-8z" fill="#fbbf24" opacity="0.7" />
        <path d="M84 50h6c0 8-4 12-10 12v-4c3 0 4-3 4-8z" fill="#fbbf24" opacity="0.7" />
        {/* Star on trophy */}
        <path d="M70 56l2 4 4 .5-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.5z" fill="white" opacity="0.8" />
        {/* Confetti */}
        <rect x="25" y="20" width="4" height="8" rx="1" fill="#ec4899" opacity="0.7" transform="rotate(15 27 24)" />
        <rect x="110" y="25" width="4" height="8" rx="1" fill="#3b82f6" opacity="0.7" transform="rotate(-20 112 29)" />
        <rect x="40" y="10" width="3" height="6" rx="1" fill="#fbbf24" opacity="0.8" transform="rotate(30 41.5 13)" />
        <rect x="95" y="15" width="3" height="6" rx="1" fill="#06b6d4" opacity="0.7" transform="rotate(-10 96.5 18)" />
        <circle cx="30" cy="40" r="3" fill="#8b5cf6" opacity="0.5" />
        <circle cx="115" cy="42" r="2.5" fill="#ec4899" opacity="0.5" />
        <circle cx="50" cy="15" r="2" fill="#06b6d4" opacity="0.6" />
        {/* Stars */}
        <path d="M20 70l2 4 4.5 .7-3 3 .8 4.5-4-2-4 2 .8-4.5-3-3 4.5-.7z" fill="#fbbf24" opacity="0.6" />
        <path d="M120 65l1.5 3 3.5 .5-2.5 2.5.6 3.5-3-1.5-3 1.5.6-3.5-2.5-2.5 3.5-.5z" fill="#fbbf24" opacity="0.5" />
        {/* XP text */}
        <text x="70" y="105" fontSize="12" fill="#8b5cf6" textAnchor="middle" fontWeight="bold" opacity="0.8">+XP</text>
      </svg>
    </TeenOnly>
  );
}

export function BrainGlow({ className, size = "md" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 120 120" className={sizes[size]} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow */}
        <circle cx="60" cy="55" r="35" fill="#8b5cf6" opacity="0.08" />
        <circle cx="60" cy="55" r="28" fill="#8b5cf6" opacity="0.05" />
        {/* Brain */}
        <path d="M50 45c-4-6-2-14 5-16 4-1 8 1 10 4 2-3 6-5 10-4 7 2 9 10 5 16" stroke="#8b5cf6" strokeWidth="2" fill="#8b5cf6" opacity="0.15" strokeLinecap="round" />
        <path d="M48 52c-3 4-2 10 3 13 3 2 7 1 9-1 2 2 6 3 9 1 5-3 6-9 3-13" stroke="#8b5cf6" strokeWidth="2" fill="#8b5cf6" opacity="0.1" strokeLinecap="round" />
        <line x1="60" y1="42" x2="60" y2="65" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5" />
        {/* Knowledge nodes */}
        <circle cx="35" cy="35" r="4" fill="#06b6d4" opacity="0.5" />
        <circle cx="85" cy="35" r="4" fill="#ec4899" opacity="0.5" />
        <circle cx="35" cy="75" r="3.5" fill="#fbbf24" opacity="0.5" />
        <circle cx="85" cy="75" r="3.5" fill="#3b82f6" opacity="0.5" />
        <line x1="39" y1="37" x2="50" y2="45" stroke="#06b6d4" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        <line x1="81" y1="37" x2="70" y2="45" stroke="#ec4899" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        <line x1="38" y1="73" x2="52" y2="62" stroke="#fbbf24" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        <line x1="82" y1="73" x2="68" y2="62" stroke="#3b82f6" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        {/* Sparkles */}
        <path d="M60 20l1.5 3 3 .7-2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2-2 3-.7z" fill="#fbbf24" opacity="0.7" />
        <circle cx="25" cy="55" r="2" fill="#8b5cf6" opacity="0.4" />
        <circle cx="95" cy="55" r="2" fill="#8b5cf6" opacity="0.4" />
      </svg>
    </TeenOnly>
  );
}

export function CorrectingMistakes({ className, size = "md" }: IllustrationProps) {
  return (
    <TeenOnly className={className}>
      <svg viewBox="0 0 120 120" className={sizes[size]} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="55" cy="95" rx="22" ry="15" fill="#06b6d4" opacity="0.1" />
        {/* Head */}
        <circle cx="55" cy="42" r="18" fill="#fef3c7" />
        <path d="M39 37c0-10 7-16 16-16s16 6 16 16" fill="#92400e" />
        {/* Happy eyes */}
        <path d="M48 42c0-2 2-3 3-1" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M58 42c0-2 2-3 3-1" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        {/* Big smile */}
        <path d="M48 49c3 4 11 4 14 0" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Paper with corrections */}
        <rect x="75" y="40" width="28" height="36" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="79" y1="48" x2="99" y2="48" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
        <line x1="79" y1="54" x2="95" y2="54" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="79" y1="60" x2="99" y2="60" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
        <line x1="79" y1="66" x2="92" y2="66" stroke="#e2e8f0" strokeWidth="1" />
        {/* Checkmarks (corrections) */}
        <path d="M80 47l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 59l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Pencil */}
        <rect x="70" y="78" width="3" height="16" rx="1" fill="#fbbf24" transform="rotate(-30 71.5 86)" />
        {/* Stars */}
        <path d="M25 25l1.5 3 3 .7-2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2-2 3-.7z" fill="#fbbf24" opacity="0.6" />
        <path d="M100 20l1 2 2 .5-1.5 1.5.3 2-1.8-1-1.8 1 .3-2-1.5-1.5 2-.5z" fill="#8b5cf6" opacity="0.5" />
      </svg>
    </TeenOnly>
  );
}
