import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MoodEntry } from "@/types/mood";
import {
  format,
  parseISO,
  subDays,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInCalendarDays,
} from "date-fns";
import { toast } from "sonner";

// Demo mood data
const demoMoodEntries: MoodEntry[] = [
  {
    id: "1",
    date: format(subDays(new Date(), 0), "MMM dd"),
    mood: 8,
    energy: 7,
    note: "Had a productive day at work",
    mood_name: "happy",
    tags: [
      {
        id: "1",
        name: "work",
        category: "activity",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    date: format(subDays(new Date(), 1), "MMM dd"),
    mood: 6,
    energy: 5,
    note: "Rainy weather, stayed indoors",
    mood_name: "calm",
    tags: [
      {
        id: "2",
        name: "weather",
        category: "weather",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: "3",
    date: format(subDays(new Date(), 2), "MMM dd"),
    mood: 9,
    energy: 8,
    note: "Great workout and meditation session",
    mood_name: "excited",
    tags: [
      {
        id: "3",
        name: "exercise",
        category: "activity",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: "4",
    date: format(subDays(new Date(), 3), "MMM dd"),
    mood: 4,
    energy: 3,
    note: "Feeling tired after a long day",
    mood_name: "tired",
    tags: [
      {
        id: "4",
        name: "work",
        category: "activity",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: subDays(new Date(), 3).toISOString(),
  },
  {
    id: "5",
    date: format(subDays(new Date(), 4), "MMM dd"),
    mood: 7,
    energy: 6,
    note: "Met with friends for dinner",
    mood_name: "happy",
    tags: [
      {
        id: "5",
        name: "social",
        category: "social",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: subDays(new Date(), 4).toISOString(),
  },
  {
    id: "6",
    date: format(subDays(new Date(), 5), "MMM dd"),
    mood: 5,
    energy: 4,
    note: "Anxious about upcoming presentation",
    mood_name: "anxious",
    tags: [
      {
        id: "6",
        name: "work",
        category: "activity",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: subDays(new Date(), 5).toISOString(),
  },
  {
    id: "7",
    date: format(subDays(new Date(), 6), "MMM dd"),
    mood: 8,
    energy: 7,
    note: "Relaxing weekend at home",
    mood_name: "calm",
    tags: [
      {
        id: "7",
        name: "home",
        category: "location",
        user_id: "mock-user-id",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: subDays(new Date(), 6).toISOString(),
  },
];

export const useMoodData = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageMood, setAverageMood] = useState(0);
  const [averageEnergy, setAverageEnergy] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestMood, setHighestMood] = useState<MoodEntry | null>(null);
  const [lowestMood, setLowestMood] = useState<MoodEntry | null>(null);

  const fetchMoodEntries = useCallback(async () => {
    try {
      setLoading(true);
      const url = import.meta.env.VITE_URL;

      // Get Token from local storage and send it to backend to get mood data
      const storedUser = localStorage.getItem("mockToken");
      let storedEntries;
      if (storedUser) {
        await fetch(url + "/api/auth/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwtToken: storedUser }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error != undefined && data.error != "") {
              toast.error(data.error);
              return;
            } else {
              // data: {_id: '67f02e433c85f911cd975c99', username: 'a', email: 'a@a.com', data: '', __v: 0} ==> data(.then(data=>{})).data(data: {_id...}).data('required data field')
              storedEntries = data.data.data;
            }
          });
      }

      // If entries were found else take them as an empty array
      let entries = storedEntries ? JSON.parse(storedEntries) : [];

      if (!storedEntries) {
        return [];
      }

      // Sort entries by created_at date (newest first)
      entries.sort((x: MoodEntry, y: MoodEntry) => {
        const dx = x.created_at ? new Date(x.created_at) : new Date();
        const dy = y.created_at ? new Date(y.created_at) : new Date();
        return dy.getTime() - dx.getTime();
      });

      setMoodHistory(entries);
      updateStats(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      toast.error("Failed to load mood entries");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStats = (history: MoodEntry[]) => {
    if (history.length === 0) return;

    // Calculate average mood and energy
    const avgMood =
      history.reduce((sum, entry) => sum + entry.mood, 0) / history.length;
    const avgEnergy =
      history.reduce((sum, entry) => sum + entry.energy, 0) / history.length;

    setAverageMood(Number(avgMood.toFixed(1)));
    setAverageEnergy(Number(avgEnergy.toFixed(1)));
    setTotalEntries(history.length);

    // Find highest and lowest mood entries
    const highestMoodEntry = [...history].sort((a, b) => b.mood - a.mood)[0];
    const lowestMoodEntry = [...history].sort((a, b) => a.mood - b.mood)[0];

    setHighestMood(highestMoodEntry);
    setLowestMood(lowestMoodEntry);

    // Calculate streak
    setCurrentStreak(calculateStreak(history));
  };

  const calculateStreak = (history: MoodEntry[]) => {
    let streak = 0;
    let currentDate = new Date();

    // Todays Entry
    const todayEntry = history.find((entry) => {
      const entryDate = new Date(entry.created_at);
      return isToday(entryDate);
    });

    if (!todayEntry) {
      const yesterdayEntry = history.find((entry) => {
        const entryDate = new Date(entry.created_at);
        return isYesterday(entryDate);
      });

      if (!yesterdayEntry) return 0;
      currentDate = subDays(new Date(), 1); // Yesterday
    }

    const sortedHistory = [...history].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    const seenDates = new Set<string>();

    for (const entry of sortedHistory) {
      const entryDate = new Date(entry.created_at);
      const diff = differenceInCalendarDays(currentDate, entryDate);

      if (diff === 0 && !seenDates.has(currentDate.toDateString())) {
        streak++;
        seenDates.add(currentDate.toDateString());
        currentDate = subDays(currentDate, 1);
      } else if (diff > 0) {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    if (user) {
      fetchMoodEntries();
    }
  }, [user, fetchMoodEntries]);

  return {
    moodHistory,
    loading,
    averageMood,
    averageEnergy,
    totalEntries,
    currentStreak,
    highestMood,
    lowestMood,
    fetchMoodEntries,
  };
};
