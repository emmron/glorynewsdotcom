import type { Category } from '$lib/types/category';

export const categories: Category[] = [
  {
    slug: 'cosplay',
    title: 'Cosplay & Fantasy',
    description: 'Cinematic transformations, prop builds, and con-life vlogs.',
    gradient: 'from-sky-500/90 via-sky-400/90 to-cyan-300/90',
    icon: '🎭'
  },
  {
    slug: 'fitness',
    title: 'Fitness & Performance',
    description: 'Follow-along workouts, recovery drills, and live coaching.',
    gradient: 'from-blue-500/90 via-cyan-400/90 to-teal-300/90',
    icon: '💪'
  },
  {
    slug: 'music',
    title: 'Music & Production',
    description: 'Studio breakdowns, sample packs, and songwriting sessions.',
    gradient: 'from-indigo-500/90 via-sky-500/90 to-cyan-400/90',
    icon: '🎛️'
  },
  {
    slug: 'photography',
    title: 'Photo & Visuals',
    description: 'Lighting recipes, presets, and concept walkthroughs.',
    gradient: 'from-blue-600/90 via-blue-400/90 to-sky-300/90',
    icon: '📸'
  },
  {
    slug: 'gaming',
    title: 'Streaming & Gaming',
    description: 'Live VOD reviews, strat labs, and IRL tech drops.',
    gradient: 'from-cyan-500/90 via-sky-500/90 to-blue-400/90',
    icon: '🎮'
  },
  {
    slug: 'wellness',
    title: 'Wellness & Mindfulness',
    description: 'Grounding flows, meditation labs, and slow living.',
    gradient: 'from-teal-500/90 via-sky-500/90 to-blue-400/90',
    icon: '🧘'
  }
];
