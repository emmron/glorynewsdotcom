import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, Circle, HelpCircle, ChevronDown, ChevronUp, Filter, RefreshCw } from 'lucide-react';

// Team type definition
interface Team {
  id: string;
  name: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // 'W', 'L', 'D' for last 5 matches
  previousPosition?: number;
  logo?: string;
}

interface LadderProps {
  teams: Team[];
  lastUpdated?: string;
  isLoading?: boolean;
}

export default function Ladder({ teams, lastUpdated, isLoading = false }: LadderProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Team; direction: 'asc' | 'desc' }>({
    key: 'position',
    direction: 'asc'
  });
  const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);

  // Sort teams based on current sort configuration
  const sortedTeams = React.useMemo(() => {
    const teamsCopy = [...teams];
    return teamsCopy.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (valueA === valueB) {
        // Secondary sort by points if primary sort values are equal
        if (sortConfig.key !== 'points') {
          return b.points - a.points;
        }
        // If points are equal, sort by goal difference
        return b.goalDifference - a.goalDifference;
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });
  }, [teams, sortConfig]);

  // Handle column header click for sorting
  const handleSort = (key: keyof Team) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Position change indicator component
  const PositionChangeIndicator = ({ team }: { team: Team }) => {
    if (!team.previousPosition) return null;

    const change = team.previousPosition - team.position;

    if (change > 0) {
      return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Form indicator component
  const FormIndicator = ({ result }: { result: string }) => {
    switch (result) {
      case 'W':
        return <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">W</span>;
      case 'D':
        return <span className="w-5 h-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center font-bold">D</span>;
      case 'L':
        return <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">L</span>;
      default:
        return <span className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center">-</span>;
    }
  };

  // Get row styling based on team position
  const getRowStyles = (position: number) => {
    // ACL qualification (positions 1-3)
    if (position <= 3) {
      return 'border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
    // Finals series qualification (positions 4-6)
    else if (position <= 6) {
      return 'border-l-4 border-green-600 bg-green-50 dark:bg-green-900/20';
    }
    // Relegation zone (if applicable)
    else if (position === teams.length) {
      return 'border-l-4 border-red-600 bg-red-50 dark:bg-red-900/20';
    }
    // Default
    return '';
  };

  // Check if team is Perth Glory
  const isPerthGlory = (teamName: string) => {
    return teamName.toLowerCase().includes('perth') || teamName.toLowerCase().includes('glory');
  };

  // Highlight Perth Glory
  const highlightPerthGlory = () => {
    const perthTeam = teams.find(team => isPerthGlory(team.name));
    if (perthTeam) setHighlightedTeamId(perthTeam.id);
    setIsFilterMenuOpen(false);
  };

  // Reset team highlighting
  const resetHighlighting = () => {
    setHighlightedTeamId(null);
    setIsFilterMenuOpen(false);
  };

  // Toggle view mode between full and compact
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'full' ? 'compact' : 'full');
  };

  // Refresh data handler (placeholder)
  const handleRefresh = () => {
    // This would trigger a refresh of the data from the API
    console.log('Refreshing data...');
  };

  // Qualification zones for the legend
  const qualificationZones = [
    { end: 3, name: 'AFC Champions League', color: 'bg-blue-600' },
    { end: 6, name: 'Finals Series', color: 'bg-green-600' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Header with controls */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">A-League Men Ladder</h3>
            {lastUpdated && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleViewMode}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {viewMode === 'full' ? 'Compact View' : 'Full View'}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filter
                {isFilterMenuOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>

              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={resetHighlighting}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Show All Teams
                    </button>
                    <button
                      onClick={highlightPerthGlory}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Highlight Perth Glory
                    </button>
                    <button
                      onClick={() => {
                        handleSort('points');
                        setIsFilterMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sort by Points
                    </button>
                    <button
                      onClick={() => {
                        handleSort('goalDifference');
                        setIsFilterMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sort by Goal Difference
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className={`inline-flex items-center p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${isLoading ? 'animate-spin' : ''}`}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Qualification zone legend */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
        {qualificationZones.map((zone, index) => (
          <div key={index} className="flex items-center">
            <span className={`w-3 h-3 ${zone.color} rounded-sm mr-2`}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{zone.name}</span>
          </div>
        ))}
      </div>

      {/* Ladder table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                Pos
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Team
              </th>
              {viewMode === 'full' && (
                <>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSort('played')}
                  >
                    <div className="flex items-center justify-center">
                      P
                      {sortConfig.key === 'played' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="w-3 h-3 ml-1" /> :
                          <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSort('won')}
                  >
                    <div className="flex items-center justify-center">
                      W
                      {sortConfig.key === 'won' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="w-3 h-3 ml-1" /> :
                          <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSort('drawn')}
                  >
                    <div className="flex items-center justify-center">
                      D
                      {sortConfig.key === 'drawn' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="w-3 h-3 ml-1" /> :
                          <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSort('lost')}
                  >
                    <div className="flex items-center justify-center">
                      L
                      {sortConfig.key === 'lost' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="w-3 h-3 ml-1" /> :
                          <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSort('goalDifference')}
                  >
                    <div className="flex items-center justify-center">
                      GD
                      {sortConfig.key === 'goalDifference' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="w-3 h-3 ml-1" /> :
                          <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </th>
                </>
              )}
              <th
                scope="col"
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('points')}
              >
                <div className="flex items-center justify-center">
                  PTS
                  {sortConfig.key === 'points' && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="w-3 h-3 ml-1" /> :
                      <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </div>
              </th>
              {viewMode === 'full' && (
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last 5
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTeams.map((team) => {
              const isHighlighted = isPerthGlory(team.name) || (highlightedTeamId && team.id === highlightedTeamId);
              return (
                <motion.tr
                  key={team.id}
                  className={`${getRowStyles(team.position)} ${isHighlighted ? 'bg-purple-50 dark:bg-purple-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                  initial={{ opacity: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: isHighlighted ? 1.01 : 1
                  }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className="font-semibold">{team.position}</span>
                      <span className="ml-1">
                        <PositionChangeIndicator team={team} />
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {team.logo ? (
                        <div className="flex-shrink-0 h-8 w-8 relative mr-3">
                          <Image
                            src={team.logo}
                            alt={`${team.name} logo`}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {team.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <Link href={`/team/${team.id}`}>
                        <a className={`text-sm font-medium hover:text-purple-700 dark:hover:text-purple-400 ${isHighlighted ? 'text-purple-800 dark:text-purple-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                          {team.name}
                        </a>
                      </Link>
                    </div>
                  </td>
                  {viewMode === 'full' && (
                    <>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {team.played}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {team.won}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {team.drawn}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                        {team.lost}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                        <span className={team.goalDifference > 0 ? 'text-green-600 dark:text-green-400' : team.goalDifference < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white">
                    {team.points}
                  </td>
                  {viewMode === 'full' && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex justify-center space-x-1">
                        {team.form.map((result, index) => (
                          <div key={index}>
                            <FormIndicator result={result} />
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with additional info */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></span>
            <span>AFC Champions League (1-3)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-600 rounded-sm mr-2"></span>
            <span>Finals Series (4-6)</span>
          </div>
          <div className="flex items-center ml-auto">
            <HelpCircle className="w-4 h-4 mr-1" />
            <Link href="/ladder/rules">
              <a className="hover:text-gray-700 dark:hover:text-gray-300">
                Competition Rules
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}