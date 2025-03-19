import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface JournalEntry {
  id?: string;
  title: string;
  situation: string;
  immediateReaction: string;
  betterResponse: string;
  followUp: string;
  createdAt: Date;
}

export const saveJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'journal_entries'), {
      ...entry,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const q = query(
      collection(db, 'journal_entries'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as JournalEntry[];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
}; 