import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const getUid = () => auth.currentUser?.uid;

const sanitize = (obj: any) => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach(key => cleaned[key] === undefined && delete cleaned[key]);
  return cleaned;
};

export const api = {
  addDiary: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await setDoc(doc(db, 'users', uid, 'diaries', id), { ...sanitize(data), createdAt: Date.now() });
  },
  updateDiary: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'diaries', id), sanitize(data));
  },
  deleteDiary: async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'diaries', id));
  },
  
  setTimetable: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await setDoc(doc(db, 'users', uid, 'timetable', id), sanitize(data));
  },
  deleteTimetable: async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'timetable', id));
  },
  
  addTodo: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await setDoc(doc(db, 'users', uid, 'todos', id), { ...sanitize(data), createdAt: Date.now() });
  },
  updateTodo: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'todos', id), sanitize(data));
  },
  deleteTodo: async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'todos', id));
  },

  addGoal: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await setDoc(doc(db, 'users', uid, 'goals', id), { ...sanitize(data), createdAt: Date.now() });
  },
  updateGoal: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'goals', id), sanitize(data));
  },
  deleteGoal: async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'goals', id));
  },

  addBucketList: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await setDoc(doc(db, 'users', uid, 'bucketList', id), { ...sanitize(data), createdAt: Date.now() });
  },
  updateBucketList: async (id: string, data: any) => {
    const uid = getUid();
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'bucketList', id), sanitize(data));
  },
  deleteBucketList: async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'bucketList', id));
  }
};
