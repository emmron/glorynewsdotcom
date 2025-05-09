import { browser } from '$app/environment';
import type { ForumCategory, ForumThread, ForumReply } from '$lib/types/forum';

// In a real app, this would be stored in a database
// For demo purposes, we'll store it in memory and localStorage

// Sample data - would be stored in a database in production
const sampleCategories: ForumCategory[] = [
  {
    id: 'general',
    name: 'General Discussion',
    description: 'Talk about anything related to Perth Glory',
    icon: 'message-circle',
    threadCount: 48,
    postCount: 367
  },
  {
    id: 'match-day',
    name: 'Match Day',
    description: 'Pre-match, live and post-match discussions',
    icon: 'calendar',
    threadCount: 124,
    postCount: 2189
  },
  {
    id: 'transfers',
    name: 'Transfers & Rumors',
    description: 'Player transfers, contract news and rumors',
    icon: 'refresh-cw',
    threadCount: 35,
    postCount: 587
  },
  {
    id: 'tactics',
    name: 'Tactics & Analysis',
    description: 'In-depth tactical discussions and match analysis',
    icon: 'layout',
    threadCount: 23,
    postCount: 419
  },
  {
    id: 'youth',
    name: 'Youth Teams',
    description: 'Discussions about Perth Glory\'s youth development',
    icon: 'users',
    threadCount: 17,
    postCount: 201
  },
  {
    id: 'womens',
    name: 'Women\'s Team',
    description: 'Perth Glory Women\'s team discussions',
    icon: 'award',
    threadCount: 29,
    postCount: 356
  }
];

const sampleThreads: ForumThread[] = [
  {
    id: 1,
    title: 'Thoughts on our performance against Sydney FC?',
    category: 'match-day',
    author: 'GloryFan1882',
    replies: 23,
    views: 412,
    lastPostDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    lastPostAuthor: 'PurplePride',
    isPinned: false,
    isLocked: false,
    content: `
      <p>What did everyone think about our performance on Saturday? I thought the defense was really solid for most of the game, especially considering Sydney's attack.</p>

      <p>The midfield struggled a bit to maintain possession in the second half, but overall I think we showed good signs. That counter-attack goal was beautifully executed!</p>

      <p>What do you think we need to work on before next week's match against Victory?</p>
    `,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    id: 2,
    title: 'Next season\'s kit leaked?',
    category: 'general',
    author: 'PerthTillIDie',
    replies: 45,
    views: 1203,
    lastPostDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    lastPostAuthor: 'Macca99',
    isPinned: true,
    isLocked: false
  },
  {
    id: 3,
    title: 'Striker options for next season',
    category: 'transfers',
    author: 'TransferGuru',
    replies: 18,
    views: 342,
    lastPostDate: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    lastPostAuthor: 'GloryDays94',
    isPinned: false,
    isLocked: false
  },
  {
    id: 4,
    title: 'Defensive issues: Analysis & Solutions',
    category: 'tactics',
    author: 'TacticalGenius',
    replies: 32,
    views: 576,
    lastPostDate: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    lastPostAuthor: 'DefenseMinded',
    isPinned: false,
    isLocked: false
  },
  {
    id: 5,
    title: 'Youth player to watch: Sam Johnson',
    category: 'youth',
    author: 'YouthScout',
    replies: 12,
    views: 198,
    lastPostDate: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    lastPostAuthor: 'FutureGlory',
    isPinned: false,
    isLocked: false
  }
];

const sampleReplies: ForumReply[] = [
  {
    id: 101,
    threadId: 1,
    author: 'PurplePride',
    authorAvatar: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
    content: `
      <p>I agree about the defense, they were impressive for most of the game. That block by Davidson in the 78th minute saved us for sure.</p>

      <p>The midfield did struggle against Sydney's press. I'd like to see us be more composed in possession next week. Victory's midfield is even stronger so we'll need to step up.</p>

      <p>That counter-attack goal was perfect though! Great finish.</p>
    `,
    likes: 12,
    isEdited: false
  },
  {
    id: 102,
    threadId: 1,
    author: 'Macca99',
    authorAvatar: '/images/avatars/macca99.jpg',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
    content: `
      <p>The defense was good but I'm a bit worried about our attacking options. We seem to rely too much on counter-attacks and set pieces.</p>

      <p>Would love to see more build-up play and sustained pressure in the final third. Sydney gave us too much space in the second half and we didn't capitalize enough.</p>

      <p>Against Victory we'll need to be more clinical with our chances.</p>
    `,
    likes: 8,
    isEdited: true
  },
  {
    id: 103,
    threadId: 1,
    author: 'CoachArmchair',
    authorAvatar: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19), // 19 hours ago
    content: `
      <p>The 4-3-3 formation doesn't seem to be working for us consistently. I think we should consider switching to a 3-5-2 against Victory to give us more solidity in midfield.</p>

      <p>Our wingers weren't tracking back enough, which left our fullbacks exposed. Victory will exploit that if we don't fix it.</p>

      <blockquote>
        <p>"The midfield did struggle against Sydney's press." - PurplePride</p>
      </blockquote>

      <p>Exactly this. We need to handle the press better. Too many loose passes when under pressure.</p>
    `,
    likes: 15,
    isEdited: false
  }
];

// Functions to interact with forum data
export function getCategories(): ForumCategory[] {
  if (browser) {
    const storedCategories = localStorage.getItem('forum_categories');
    if (storedCategories) {
      try {
        return JSON.parse(storedCategories);
      } catch (error) {
        console.error('Error parsing stored categories:', error);
      }
    }

    // If no stored categories or error parsing, save the sample categories
    localStorage.setItem('forum_categories', JSON.stringify(sampleCategories));
  }

  return sampleCategories;
}

export function getThreads(): ForumThread[] {
  if (browser) {
    const storedThreads = localStorage.getItem('forum_threads');
    if (storedThreads) {
      try {
        const parsedThreads = JSON.parse(storedThreads);
        return parsedThreads.map((thread: any) => ({
          ...thread,
          lastPostDate: new Date(thread.lastPostDate),
          createdAt: thread.createdAt ? new Date(thread.createdAt) : undefined
        }));
      } catch (error) {
        console.error('Error parsing stored threads:', error);
      }
    }

    // If no stored threads or error parsing, save the sample threads
    localStorage.setItem('forum_threads', JSON.stringify(sampleThreads));
  }

  return sampleThreads;
}

export function getThreadsByCategory(categoryId: string): ForumThread[] {
  const threads = getThreads();
  return threads.filter(thread => thread.category === categoryId);
}

export function getThread(id: number): ForumThread | undefined {
  const threads = getThreads();
  return threads.find(thread => thread.id === id);
}

export function getRepliesByThread(threadId: number): ForumReply[] {
  if (browser) {
    const storedReplies = localStorage.getItem('forum_replies');
    if (storedReplies) {
      try {
        const parsedReplies = JSON.parse(storedReplies);
        const replies = parsedReplies.map((reply: any) => ({
          ...reply,
          createdAt: new Date(reply.createdAt)
        }));
        return replies.filter((reply: ForumReply) => reply.threadId === threadId);
      } catch (error) {
        console.error('Error parsing stored replies:', error);
      }
    }

    // If no stored replies or error parsing, save the sample replies
    localStorage.setItem('forum_replies', JSON.stringify(sampleReplies));
  }

  return sampleReplies.filter(reply => reply.threadId === threadId);
}

export function addReply(reply: Omit<ForumReply, 'id'>): ForumReply {
  if (!browser) throw new Error('Cannot add reply on server');

  const replies = getRepliesByThread(reply.threadId);
  const allReplies = getAllReplies();

  const newReply: ForumReply = {
    ...reply,
    id: Math.max(...allReplies.map(r => r.id), 0) + 1
  };

  const updatedReplies = [...allReplies, newReply];
  localStorage.setItem('forum_replies', JSON.stringify(updatedReplies));

  // Update thread info
  const threads = getThreads();
  const threadIndex = threads.findIndex(t => t.id === reply.threadId);

  if (threadIndex >= 0) {
    threads[threadIndex].replies += 1;
    threads[threadIndex].lastPostDate = new Date();
    threads[threadIndex].lastPostAuthor = reply.author;
    localStorage.setItem('forum_threads', JSON.stringify(threads));
  }

  return newReply;
}

function getAllReplies(): ForumReply[] {
  if (browser) {
    const storedReplies = localStorage.getItem('forum_replies');
    if (storedReplies) {
      try {
        const parsedReplies = JSON.parse(storedReplies);
        return parsedReplies.map((reply: any) => ({
          ...reply,
          createdAt: new Date(reply.createdAt)
        }));
      } catch (error) {
        console.error('Error parsing stored replies:', error);
        return sampleReplies;
      }
    }

    localStorage.setItem('forum_replies', JSON.stringify(sampleReplies));
    return sampleReplies;
  }

  return sampleReplies;
}

export function incrementThreadViews(threadId: number): void {
  if (!browser) return;

  const threads = getThreads();
  const threadIndex = threads.findIndex(t => t.id === threadId);

  if (threadIndex >= 0) {
    threads[threadIndex].views += 1;
    localStorage.setItem('forum_threads', JSON.stringify(threads));
  }
}
