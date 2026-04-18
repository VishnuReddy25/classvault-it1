// Gradient utilities — used by vault covers, memory cards, etc.
export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6c47ff,#3b82f6)',
  'linear-gradient(135deg,#f43f5e,#f97316)',
  'linear-gradient(135deg,#14b8a6,#3b82f6)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#3b82f6)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
];

export const COVER_GRADIENTS = {
  Trip:    'linear-gradient(135deg,#c7d2fe,#a5f3fc)',
  Party:   'linear-gradient(135deg,#fbcfe8,#fde68a)',
  College: 'linear-gradient(135deg,#bbf7d0,#a5f3fc)',
  Other:   'linear-gradient(135deg,#e9d5ff,#fbcfe8)',
  Locked:  'linear-gradient(135deg,#fef3c7,#fde68a)',
};

export const MEMORY_GRADIENTS = [
  'linear-gradient(135deg,#c7d2fe,#a5f3fc)',
  'linear-gradient(135deg,#fbcfe8,#fde68a)',
  'linear-gradient(135deg,#bbf7d0,#c7d2fe)',
  'linear-gradient(135deg,#fde68a,#fca5a5)',
  'linear-gradient(135deg,#a5f3fc,#d9f99d)',
  'linear-gradient(135deg,#f9a8d4,#c7d2fe)',
  'linear-gradient(135deg,#ddd6fe,#fbcfe8)',
  'linear-gradient(135deg,#bfdbfe,#c7d2fe)',
];

export const THEMES      = ['Trip', 'Party', 'College', 'Other'];
export const THEME_EMOJIS = { Trip:'🌊', Party:'🎉', College:'📚', Other:'✦' };

// No dummy vaults or memories — all content is user-generated
export const SAMPLE_VAULTS   = [];
export const SAMPLE_MEMORIES = [];

export const REACTION_KEYS = [
  { key: 'heart', emoji: '❤️'  },
  { key: 'laugh', emoji: '😂'  },
  { key: 'fire',  emoji: '🔥'  },
  { key: 'wow',   emoji: '🤩'  },
];
