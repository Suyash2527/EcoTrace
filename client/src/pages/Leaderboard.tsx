import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

// Mock data for hackathon purposes
const MOCK_LEADERBOARD = [
  { id: '1', name: 'Alex M.', score: 142, trend: 'down', rank: 1 },
  { id: '2', name: 'Sarah J.', score: 156, trend: 'up', rank: 2 },
  { id: '3', name: 'Chris K.', score: 189, trend: 'down', rank: 3 },
  { id: '4', name: 'Eco Warrior', score: 210, trend: 'same', rank: 4, isCurrentUser: true },
  { id: '5', name: 'Jordan T.', score: 245, trend: 'up', rank: 5 },
  { id: '6', name: 'Mia W.', score: 280, trend: 'down', rank: 6 },
];

export function Leaderboard() {
  const { profile } = useAuth();
  
  // Replace current user placeholder
  const board = MOCK_LEADERBOARD.map(u => 
    u.isCurrentUser 
      ? { ...u, name: profile?.displayName || 'You', score: profile?.totalCO2Kg || u.score } 
      : u
  ).sort((a, b) => a.score - b.score).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Global Leaderboard</h1>
        <p className="text-forest-300">Lowest carbon footprint wins. Based on monthly total.</p>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-forest-400/20 bg-forest-900/50">
                <th className="p-4 font-medium text-forest-300 w-16 text-center">Rank</th>
                <th className="p-4 font-medium text-forest-300">User</th>
                <th className="p-4 font-medium text-forest-300 text-right">CO2 (kg)</th>
                <th className="p-4 font-medium text-forest-300 text-center w-24">Trend</th>
              </tr>
            </thead>
            <tbody>
              {board.map((user) => (
                <tr 
                  key={user.id} 
                  className={`border-b border-forest-400/10 last:border-0 transition-colors ${
                    user.isCurrentUser ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'hover:bg-forest-800/50'
                  }`}
                >
                  <td className="p-4 text-center">
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : (
                      <span className="text-forest-400 font-mono">{user.rank}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className={`font-medium ${user.isCurrentUser ? 'text-amber-400' : 'text-cream-100'}`}>
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <Badge variant="warning" className="ml-2 scale-75 origin-left">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-cream-200">
                    {user.score.toFixed(1)}
                  </td>
                  <td className="p-4 text-center">
                    {user.trend === 'down' ? (
                      <span className="text-green-400">↓</span>
                    ) : user.trend === 'up' ? (
                      <span className="text-red-400">↑</span>
                    ) : (
                      <span className="text-forest-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
