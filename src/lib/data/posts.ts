import type { Post } from '$lib/types/post';

export const posts: Post[] = [
  {
    id: 'post-aurora-01',
    creatorId: 'aurora-vale',
    title: 'Neon Valkyrie drop is live ⚔️',
    body: 'Full armor breakdown + 50 behind-the-scenes shots from our Tokyo night shoot. Downloadable patterns included!',
    media: {
      type: 'gallery',
      sources: [
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1601570824094-921fce81e065?auto=format&fit=crop&w=900&q=80'
      ],
      aspectRatio: '4/5'
    },
    likes: 12400,
    comments: 312,
    tips: 86,
    tags: ['cosplay', 'bts', 'pattern-pack'],
    createdAt: '2024-04-12T09:45:00Z',
    isFree: true,
    views: 98400
  },
  {
    id: 'post-kai-01',
    creatorId: 'kai-rias',
    title: 'Scrim live strat review',
    body: 'Unlocked our stage finals VOD with live annotations. Timestamped tactics + loadout sheets in the comments.',
    media: {
      type: 'video',
      sources: ['https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4'],
      poster: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
      aspectRatio: '16/9'
    },
    likes: 18200,
    comments: 486,
    tips: 214,
    tags: ['gaming', 'analysis', 'vod-review'],
    createdAt: '2024-04-11T22:10:00Z',
    isFree: true,
    views: 126000
  },
  {
    id: 'post-luca-01',
    creatorId: 'luca-cass',
    title: 'Mobility reset for desk creators',
    body: '15-minute flow with resistance band progressions. Perfect for anyone editing all day—no equipment needed.',
    media: {
      type: 'image',
      sources: ['https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80'],
      aspectRatio: '3/4'
    },
    likes: 8600,
    comments: 204,
    tips: 72,
    tags: ['mobility', 'wellness', 'flow'],
    createdAt: '2024-04-10T18:30:00Z',
    isFree: true,
    views: 74200
  },
  {
    id: 'post-noir-01',
    creatorId: 'noir-lex',
    title: 'Analog synth patch walk-through',
    body: 'Layered this dreamy lead in 3 passes—breaking down routing, automation, and the MIDI pack download.',
    media: {
      type: 'video',
      sources: ['https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4'],
      poster: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
      aspectRatio: '16/9'
    },
    likes: 6100,
    comments: 154,
    tips: 59,
    tags: ['studio-session', 'tutorial', 'sound-design'],
    createdAt: '2024-04-09T13:05:00Z',
    isFree: true,
    views: 58900
  },
  {
    id: 'post-zara-01',
    creatorId: 'zara-vyx',
    title: 'Cinematic lighting recipe',
    body: 'Diagrammed the grids + gels from our noir portrait series. PSD + light map download included!',
    media: {
      type: 'gallery',
      sources: [
        'https://images.unsplash.com/photo-1526481280695-3c46973b2f37?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'
      ],
      aspectRatio: '4/5'
    },
    likes: 7200,
    comments: 198,
    tips: 63,
    tags: ['photo-edit', 'lighting', 'behind-the-scenes'],
    createdAt: '2024-04-08T20:20:00Z',
    isFree: true,
    views: 64200
  },
  {
    id: 'post-amara-01',
    creatorId: 'amara-sol',
    title: 'Sunrise grounding set',
    body: 'Guided breath + slow morning flow filmed on retreat. Playlist + journal prompts pinned below.',
    media: {
      type: 'image',
      sources: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80'],
      aspectRatio: '3/4'
    },
    likes: 5400,
    comments: 126,
    tips: 48,
    tags: ['mindfulness', 'yoga', 'retreat'],
    createdAt: '2024-04-08T05:45:00Z',
    isFree: true,
    views: 50800
  }
];
