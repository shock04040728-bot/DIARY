import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { UserSettings, DiaryEntry, TimetableEntry, TodoEntry, GoalEntry, BucketListEntry } from '../types';

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({ location: 'Seoul, South Korea', font: 'font-sans', theme: 'light' });
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [todos, setTodos] = useState<TodoEntry[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [bucketList, setBucketList] = useState<BucketListEntry[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      if (currUser) {
        setUser(currUser);
        setError(null);
        
        // Listen to settings
        const settingsRef = doc(db, 'users', currUser.uid);
        const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().settings) {
            setSettings(docSnap.data().settings);
          }
        });

        // Listen to diaries
        const diariesRef = collection(db, 'users', currUser.uid, 'diaries');
        const qDiaries = query(diariesRef, orderBy('date', 'desc'));
        const unsubDiaries = onSnapshot(qDiaries, (snap) => {
          setDiaries(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiaryEntry)));
        });

        // Listen to timetables
        const timetableRef = collection(db, 'users', currUser.uid, 'timetable');
        const unsubTimetables = onSnapshot(timetableRef, (snap) => {
          setTimetables(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimetableEntry)));
        });

        // Listen to todos
        const todosRef = collection(db, 'users', currUser.uid, 'todos');
        const qTodos = query(todosRef, orderBy('createdAt', 'desc'));
        const unsubTodos = onSnapshot(qTodos, (snap) => {
          setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() } as TodoEntry)));
        });

        // Listen to goals
        const goalsRef = collection(db, 'users', currUser.uid, 'goals');
        const qGoals = query(goalsRef, orderBy('createdAt', 'asc'));
        const unsubGoals = onSnapshot(qGoals, (snap) => {
          setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as GoalEntry)));
        });

        // Listen to bucket list
        const bucketRef = collection(db, 'users', currUser.uid, 'bucketList');
        const qBucket = query(bucketRef, orderBy('createdAt', 'asc'));
        const unsubBucket = onSnapshot(qBucket, (snap) => {
          setBucketList(snap.docs.map(d => ({ id: d.id, ...d.data() } as BucketListEntry)));
        });

        setLoading(false);
        return () => {
          unsubSettings();
          unsubDiaries();
          unsubTimetables();
          unsubTodos();
          unsubGoals();
          unsubBucket();
        };
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    await setDoc(doc(db, 'users', user.uid), { settings: merged }, { merge: true });
    setSettings(merged);
  };

  return {
    user, loading, error, settings, updateSettings,
    diaries, timetables, todos, goals, bucketList
  };
}
