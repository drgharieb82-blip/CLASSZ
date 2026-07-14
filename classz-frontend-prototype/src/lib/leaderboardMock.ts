export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  quizAvg: number;
  badges: number;
  isMe?: boolean;
}

export interface MonthlyChampion {
  month: string;
  name: string;
  avatar: string;
  xp: number;
  title: string;
}

export interface BadgeRecord {
  name: string;
  emoji: string;
  date: string;
  rarity: "common" | "rare" | "legendary";
}

export interface LeaderboardData {
  allTime: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  courses: { id: string; name: string; emoji: string; leaderboard: LeaderboardEntry[] }[];
  subjects: { name: string; emoji: string; leaderboard: LeaderboardEntry[] }[];
  monthlyChampions: MonthlyChampion[];
  myBadges: BadgeRecord[];
  myStats: {
    rank: number;
    xp: number;
    streak: number;
    longestStreak: number;
    quizAvg: number;
    totalBadges: number;
    percentile: string;
    xpToNextRank: number;
    nextRankName: string;
  };
}

const allTimeBoard: LeaderboardEntry[] = [
  { rank: 1, name: "Aya Mansour", avatar: "AM", xp: 12480, streak: 64, quizAvg: 97, badges: 24 },
  { rank: 2, name: "Omar Tarek", avatar: "OT", xp: 11920, streak: 51, quizAvg: 95, badges: 21 },
  { rank: 3, name: "Lina Fares", avatar: "LF", xp: 11340, streak: 47, quizAvg: 94, badges: 19 },
  { rank: 4, name: "Karim Adel", avatar: "KA", xp: 10200, streak: 38, quizAvg: 90, badges: 17 },
  { rank: 5, name: "You", avatar: "ME", xp: 10870, streak: 23, quizAvg: 88, badges: 14, isMe: true },
  { rank: 6, name: "Nour Sami", avatar: "NS", xp: 9420, streak: 30, quizAvg: 87, badges: 13 },
  { rank: 7, name: "Hadi Wael", avatar: "HW", xp: 8870, streak: 18, quizAvg: 85, badges: 11 },
  { rank: 8, name: "Sara Hassan", avatar: "SH", xp: 8340, streak: 22, quizAvg: 86, badges: 10 },
  { rank: 9, name: "Mohamed Ali", avatar: "MA", xp: 7980, streak: 15, quizAvg: 82, badges: 9 },
  { rank: 10, name: "Dina Salem", avatar: "DS", xp: 7650, streak: 12, quizAvg: 80, badges: 8 },
];

const monthlyBoard: LeaderboardEntry[] = [
  { rank: 1, name: "Omar Tarek", avatar: "OT", xp: 2840, streak: 20, quizAvg: 96, badges: 4 },
  { rank: 2, name: "You", avatar: "ME", xp: 2620, streak: 23, quizAvg: 88, badges: 3, isMe: true },
  { rank: 3, name: "Aya Mansour", avatar: "AM", xp: 2510, streak: 20, quizAvg: 95, badges: 3 },
  { rank: 4, name: "Lina Fares", avatar: "LF", xp: 2380, streak: 18, quizAvg: 92, badges: 2 },
  { rank: 5, name: "Karim Adel", avatar: "KA", xp: 2100, streak: 14, quizAvg: 89, badges: 2 },
  { rank: 6, name: "Nour Sami", avatar: "NS", xp: 1890, streak: 10, quizAvg: 85, badges: 1 },
  { rank: 7, name: "Hadi Wael", avatar: "HW", xp: 1740, streak: 8, quizAvg: 84, badges: 1 },
  { rank: 8, name: "Sara Hassan", avatar: "SH", xp: 1620, streak: 12, quizAvg: 83, badges: 1 },
];

const friendsBoard: LeaderboardEntry[] = [
  { rank: 1, name: "Omar Tarek", avatar: "OT", xp: 11920, streak: 51, quizAvg: 95, badges: 21 },
  { rank: 2, name: "You", avatar: "ME", xp: 10870, streak: 23, quizAvg: 88, badges: 14, isMe: true },
  { rank: 3, name: "Karim Adel", avatar: "KA", xp: 10200, streak: 38, quizAvg: 90, badges: 17 },
  { rank: 4, name: "Nour Sami", avatar: "NS", xp: 9420, streak: 30, quizAvg: 87, badges: 13 },
  { rank: 5, name: "Hadi Wael", avatar: "HW", xp: 8870, streak: 18, quizAvg: 85, badges: 11 },
];

export const leaderboardData: LeaderboardData = {
  allTime: allTimeBoard,
  monthly: monthlyBoard,
  friends: friendsBoard,
  courses: [
    {
      id: "c-chem", name: "Chemistry Grade 12", emoji: "🧪",
      leaderboard: [
        { rank: 1, name: "Mariam Nabil", avatar: "MN", xp: 5340, streak: 39, quizAvg: 97, badges: 8 },
        { rank: 2, name: "Salma Hassan", avatar: "SH", xp: 5060, streak: 34, quizAvg: 94, badges: 7 },
        { rank: 3, name: "Youssef Adel", avatar: "YA", xp: 4830, streak: 29, quizAvg: 92, badges: 6 },
        { rank: 4, name: "You", avatar: "ME", xp: 3520, streak: 14, quizAvg: 82, badges: 4, isMe: true },
        { rank: 5, name: "Lina Samir", avatar: "LS", xp: 3290, streak: 21, quizAvg: 89, badges: 4 },
      ],
    },
    {
      id: "c-phys", name: "Physics Grade 12", emoji: "⚛️",
      leaderboard: [
        { rank: 1, name: "Lina Fares", avatar: "LF", xp: 5120, streak: 45, quizAvg: 98, badges: 9 },
        { rank: 2, name: "Omar Tarek", avatar: "OT", xp: 4890, streak: 32, quizAvg: 95, badges: 7 },
        { rank: 3, name: "You", avatar: "ME", xp: 3410, streak: 18, quizAvg: 76, badges: 3, isMe: true },
        { rank: 4, name: "Karim Adel", avatar: "KA", xp: 3210, streak: 24, quizAvg: 90, badges: 5 },
        { rank: 5, name: "Nour Sami", avatar: "NS", xp: 2980, streak: 19, quizAvg: 87, badges: 3 },
      ],
    },
    {
      id: "c-math", name: "Advanced Mathematics", emoji: "📐",
      leaderboard: [
        { rank: 1, name: "Aya Mansour", avatar: "AM", xp: 5480, streak: 42, quizAvg: 97, badges: 10 },
        { rank: 2, name: "Omar Tarek", avatar: "OT", xp: 5120, streak: 35, quizAvg: 95, badges: 8 },
        { rank: 3, name: "Lina Fares", avatar: "LF", xp: 4810, streak: 30, quizAvg: 94, badges: 7 },
        { rank: 4, name: "Karim Adel", avatar: "KA", xp: 4290, streak: 26, quizAvg: 90, badges: 6 },
        { rank: 5, name: "You", avatar: "ME", xp: 3980, streak: 23, quizAvg: 85, badges: 5, isMe: true },
      ],
    },
  ],
  subjects: [
    {
      name: "Chemistry", emoji: "🧪",
      leaderboard: [
        { rank: 1, name: "Mariam Nabil", avatar: "MN", xp: 5340, streak: 39, quizAvg: 97, badges: 8 },
        { rank: 2, name: "Aya Mansour", avatar: "AM", xp: 4980, streak: 36, quizAvg: 94, badges: 7 },
        { rank: 3, name: "You", avatar: "ME", xp: 3520, streak: 14, quizAvg: 82, badges: 4, isMe: true },
      ],
    },
    {
      name: "Physics", emoji: "⚛️",
      leaderboard: [
        { rank: 1, name: "Lina Fares", avatar: "LF", xp: 5120, streak: 45, quizAvg: 98, badges: 9 },
        { rank: 2, name: "Omar Tarek", avatar: "OT", xp: 4890, streak: 32, quizAvg: 95, badges: 7 },
        { rank: 3, name: "You", avatar: "ME", xp: 3410, streak: 18, quizAvg: 76, badges: 3, isMe: true },
      ],
    },
    {
      name: "Mathematics", emoji: "📐",
      leaderboard: [
        { rank: 1, name: "Aya Mansour", avatar: "AM", xp: 5480, streak: 42, quizAvg: 97, badges: 10 },
        { rank: 2, name: "Omar Tarek", avatar: "OT", xp: 5120, streak: 35, quizAvg: 95, badges: 8 },
        { rank: 3, name: "You", avatar: "ME", xp: 3980, streak: 23, quizAvg: 85, badges: 5, isMe: true },
      ],
    },
  ],
  monthlyChampions: [
    { month: "June 2026", name: "Omar Tarek", avatar: "OT", xp: 2840, title: "Monthly Champion" },
    { month: "May 2026", name: "Aya Mansour", avatar: "AM", xp: 3120, title: "Monthly Champion" },
    { month: "April 2026", name: "Lina Fares", avatar: "LF", xp: 2960, title: "Monthly Champion" },
    { month: "March 2026", name: "Aya Mansour", avatar: "AM", xp: 3050, title: "Monthly Champion" },
  ],
  myBadges: [
    { name: "Problem Solver", emoji: "🏅", date: "Jun 18", rarity: "common" },
    { name: "Week Warrior", emoji: "⭐", date: "Jun 15", rarity: "common" },
    { name: "Quiz Master", emoji: "🏆", date: "Jun 12", rarity: "rare" },
    { name: "First Steps", emoji: "👣", date: "Jun 1", rarity: "common" },
    { name: "Streak King", emoji: "🔥", date: "Jun 10", rarity: "rare" },
    { name: "Perfect Score", emoji: "💯", date: "Jun 8", rarity: "legendary" },
  ],
  myStats: {
    rank: 5,
    xp: 10870,
    streak: 23,
    longestStreak: 31,
    quizAvg: 88,
    totalBadges: 14,
    percentile: "Top 8%",
    xpToNextRank: 670,
    nextRankName: "Karim Adel",
  },
};
