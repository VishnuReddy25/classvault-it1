import { AVATAR_GRADIENTS } from '../data/sampleData';

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function nameGradient(name = '') {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
}

export function simpleHash(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return h.toString(16).padStart(8, '0');
}

export function generateInviteLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return `classvault.app/join/${slug}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function totalReactions(memory) {
  return Object.values(memory.reactions).reduce((a, b) => a + b, 0);
}

export function vaultStats(vault) {
  const allReactions = (vault.memories || []).reduce((s, m) => s + totalReactions(m), 0);
  const allComments  = (vault.memories || []).reduce((s, m) => s + (m.comments?.length || 0), 0);
  return { photos: vault.memories?.length || 0, reactions: allReactions, comments: allComments };
}

export async function compressImage(file) {
  // Dynamic import of browser-image-compression
  const imageCompression = (await import('browser-image-compression')).default;
  const options = {
    maxSizeMB: 0.7,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
  };
  const compressed = await imageCompression(file, options);
  const savedPct = Math.round((1 - compressed.size / file.size) * 100);
  return { file: compressed, savedPct: Math.max(0, savedPct) };
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
