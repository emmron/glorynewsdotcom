import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
// ... existing code ...

// Add new imports for UI components and animations
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ChevronRight, Tag } from 'lucide-react';
import { useState } from 'react';

// Types for news articles
interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  publishDate: string;
  sourceUrl: string;
  author?: string;
  image?: string;
  categories: string[];
  tags: string[];
}

interface HomeProps {
  featuredArticles: Article[];
  latestNews: Article[];
  matchInfo?: {
    opponent: string;
    date: string;
    time: string;
    venue: string;
    competition: string;
    ticketLink?: string;
  };
}

export default function Home({ featuredArticles, latestNews, matchInfo }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All News' },
    { id: 'match-reports', name: 'Match Reports' },
    { id: 'team-news', name: 'Team News' },
    { id: 'transfers', name: 'Transfers' },
    { id: 'a-league', name: 'A-League' },
  ];

  // Container animation for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Item animation for cards
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Layout title="Perth Glory News - Latest Updates & News">
      {/* Hero section with featured article */}
      <section className="mb-12">
        {featuredArticles?.[0] && (
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 md:aspect-h-6 lg:aspect-h-5">
              {featuredArticles[0].image ? (
                <Image
                  src={featuredArticles[0].image}
                  alt={featuredArticles[0].title}
                  layout="fill"
                  objectFit="cover"
                  priority
                  className="transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-700 to-purple-900" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  {featuredArticles[0].categories.slice(0, 2).map(category => (
                    <span
                      key={category}
                      className="bg-purple-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                  {featuredArticles[0].title}
                </h1>
                <p className="text-gray-200 text-sm md:text-base mb-4 max-w-2xl line-clamp-3">
                  {featuredArticles[0].excerpt}
                </p>
                <div className="flex items-center text-gray-300 text-sm mb-5">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(featuredArticles[0].publishDate)}</span>
                  {featuredArticles[0].author && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{featuredArticles[0].author}</span>
                    </>
                  )}
                </div>
                <Link href={`/news/${featuredArticles[0].id}`}>
                  <a className="inline-flex items-center bg-purple-700 hover:bg-purple-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Next match banner */}
      {matchInfo && (
        <motion.section
          className="mb-12 bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Next Match: Perth Glory vs {matchInfo.opponent}
                </h2>
                <div className="flex flex-wrap items-center text-white/90 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{matchInfo.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{matchInfo.time}</span>
                  </div>
                  <div>
                    <span className="font-medium">{matchInfo.venue}</span>
                  </div>
                  <div>
                    <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded">
                      {matchInfo.competition}
                    </span>
                  </div>
                </div>
              </div>
              {matchInfo.ticketLink && (
                <Link href={matchInfo.ticketLink}>
                  <a className="inline-flex items-center bg-white hover:bg-gray-100 text-purple-900 font-medium px-5 py-2.5 rounded-lg transition-colors mt-2 md:mt-0">
                    Get Tickets
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </Link>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Latest news section with category tabs */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Latest News
          </h2>
          <Link href="/news">
            <a className="text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </Link>
        </div>

        {/* Category filter tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* News card grid with animations */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {latestNews.map(article => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <Link href={`/news/${article.id}`}>
                <a className="block">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-700 to-purple-900" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex gap-2 mb-2">
                      {article.categories.slice(0, 1).map(category => (
                        <span
                          key={category}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(article.publishDate)}</span>
                      {article.author && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{article.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats and standings quick view */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          A-League Quick Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Ladder Position
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-purple-700 dark:text-purple-400">
                  6th
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Current A-League position
                </p>
              </div>
              <Link href="/ladder">
                <a className="text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center">
                  View Full Ladder
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Season Overview
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  8
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Wins
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  5
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Draws
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  7
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Losses
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter subscription */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 md:p-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Stay Updated with Glory News
              </h2>
              <p className="text-white/90 mb-6">
                Subscribe to our newsletter to receive the latest Perth Glory news, match previews, and exclusive content straight to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-gray-100 text-purple-900 font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-white/70 text-sm mt-4">
                We respect your privacy and will never share your information.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // This would fetch data from your API
  // For now using mock data
  const featuredArticles = [
    {
      id: 'glory-secure-crucial-victory',
      title: 'Glory Secure Crucial Victory in Thrilling Contest Against Melbourne City',
      excerpt: 'Perth Glory has secured an important three points with a 2-1 victory over Melbourne City at HBF Park, boosting their finals hopes in an entertaining contest.',
      content: '...',
      publishDate: '2023-05-15T10:30:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/glory-secure-crucial-victory',
      author: 'Glory Media',
      image: '/images/featured-victory.jpg',
      categories: ['Match Reports', 'A-League Men'],
      tags: ['Victory', 'Melbourne City', 'HBF Park']
    }
  ];

  const latestNews = [
    {
      id: 'fornaroli-hat-trick',
      title: 'Fornaroli Hat-Trick Inspires Glory to Dominant Win',
      excerpt: 'Bruno Fornaroli netted a superb hat-trick as Perth Glory romped to a commanding 4-0 victory over Wellington Phoenix.',
      content: '...',
      publishDate: '2023-05-12T14:20:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/fornaroli-hat-trick',
      author: 'Glory Media',
      image: '/images/fornaroli-hat-trick.jpg',
      categories: ['Match Reports', 'A-League Men'],
      tags: ['Fornaroli', 'Hat-trick', 'Wellington Phoenix']
    },
    {
      id: 'new-signing-announcement',
      title: 'Glory Announces Exciting New International Signing',
      excerpt: 'Perth Glory FC is delighted to announce the signing of international midfielder Marco Rodriguez on a two-year deal.',
      content: '...',
      publishDate: '2023-05-10T09:15:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/new-signing-announcement',
      author: 'Glory Media',
      image: '/images/new-signing.jpg',
      categories: ['Transfer News', 'Team News'],
      tags: ['Signing', 'Transfer', 'International']
    },
    {
      id: 'youth-academy-prospects',
      title: 'Rising Stars: Glory Youth Academy Prospects to Watch',
      excerpt: 'We profile the most promising young talents emerging from Perth Glory's renowned youth academy system.',
      content: '...',
      publishDate: '2023-05-08T11:45:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/youth-academy-prospects',
      author: 'Development Staff',
      image: '/images/youth-prospects.jpg',
      categories: ['Youth', 'Academy'],
      tags: ['Youth Development', 'Academy', 'Future Stars']
    },
    {
      id: 'injury-update-squad',
      title: 'Squad Update: Latest on Injuries Ahead of Crucial Clash',
      excerpt: 'Head coach provides the latest injury updates ahead of this weekend's important fixture against Adelaide United.',
      content: '...',
      publishDate: '2023-05-05T16:30:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/injury-update',
      author: 'Medical Team',
      image: '/images/injury-update.jpg',
      categories: ['Team News', 'A-League Men'],
      tags: ['Injuries', 'Squad Update', 'Adelaide United']
    },
    {
      id: 'stadium-redevelopment',
      title: 'HBF Park Set for Major Redevelopment',
      excerpt: 'Perth Glory's home ground at HBF Park will undergo a significant redevelopment to improve facilities and capacity.',
      content: '...',
      publishDate: '2023-05-03T10:00:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/stadium-redevelopment',
      author: 'Club Statement',
      image: '/images/stadium-redevelopment.jpg',
      categories: ['Club News', 'Facilities'],
      tags: ['HBF Park', 'Stadium', 'Development']
    },
    {
      id: 'fan-appreciation-day',
      title: 'Glory Announces Fan Appreciation Day',
      excerpt: 'Perth Glory will hold a special Fan Appreciation Day with player meet-and-greets, activities and special offers.',
      content: '...',
      publishDate: '2023-05-01T09:20:00Z',
      sourceUrl: 'https://www.perthglory.com.au/news/fan-appreciation-day',
      author: 'Community Team',
      image: '/images/fan-day.jpg',
      categories: ['Fan Zone', 'Events'],
      tags: ['Fans', 'Community', 'Events']
    }
  ];

  const matchInfo = {
    opponent: 'Western Sydney Wanderers',
    date: 'Saturday, June 10, 2023',
    time: '7:30 PM AWST',
    venue: 'HBF Park, Perth',
    competition: 'A-League Men',
    ticketLink: '/tickets/next-match'
  };

  return {
    props: {
      featuredArticles,
      latestNews,
      matchInfo
    },
    // Revalidate every hour
    revalidate: 3600
  };
}