/**
 * Dashboard Firebase Integration
 * Manages all content (videos, exams, notes, materials, testimonials) using Firebase
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxxx", // سيتم استبدالها من .env
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxx",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==================== TYPES ====================

interface Video {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  grade: '1' | '2' | '3';
  duration?: number;
  createdBy: string;
  createdAt: any;
}

interface Exam {
  id?: string;
  title: string;
  description: string;
  grade: '1' | '2' | '3';
  type: 'true-false' | 'multiple-choice' | 'mixed';
  questions: Question[];
  duration: number;
  startTime: string;
  endTime: string;
  createdBy: string;
  createdAt: any;
}

interface Question {
  id: string;
  type: 'true-false' | 'multiple-choice';
  question: string;
  options?: string[];
  correctAnswer: number | boolean;
  points: number;
}

interface Note {
  id?: string;
  title: string;
  content: string;
  category: 'general' | 'important' | 'exam';
  grade?: '1' | '2' | '3';
  createdBy: string;
  createdAt: any;
}

interface Material {
  id?: string;
  title: string;
  description: string;
  grade: '1' | '2' | '3';
  fileUrl: string;
  fileName: string;
  fileSize: string;
  createdBy: string;
  createdAt: any;
}

interface Testimonial {
  id?: string;
  studentName: string;
  studentEmail?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: any;
}

// ==================== AUTHENTICATION ====================

export class DashboardAuth {
  private currentUser: FirebaseUser | null = null;

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (!user) {
        this.redirectToLogin();
      } else {
        this.checkTeacherRole(user);
      }
    });
  }

  private async checkTeacherRole(user: FirebaseUser) {
    try {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', user.uid))
      );

      if (userDoc.empty) {
        this.showToast('المستخدم غير موجود', 'error');
        this.redirectToLogin();
        return;
      }

      const userData = userDoc.docs[0].data();
      if (userData.role !== 'teacher') {
        this.showToast('هذه الصفحة مخصصة للمدرسين فقط', 'error');
        setTimeout(() => {
          window.location.href = '/pages/profile.html';
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking role:', error);
      this.redirectToLogin();
    }
  }

  private redirectToLogin() {
    this.showToast('يجب تسجيل الدخول أولاً', 'warning');
    setTimeout(() => {
      window.location.href = '/pages/login.html';
    }, 2000);
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    // Toast implementation (will be added to HTML)
    console.log(`[${type}] ${message}`);
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }
}

// ==================== VIDEO MANAGEMENT ====================

export class VideoManager {
  private collectionName = 'videos';

  async addVideo(videoData: Omit<Video, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...videoData,
        createdAt: serverTimestamp()
      });
      console.log('✅ Video added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding video:', error);
      throw error;
    }
  }

  async getVideos(grade?: '1' | '2' | '3'): Promise<Video[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (grade) {
        q = query(
          collection(db, this.collectionName),
          where('grade', '==', grade),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const videos: Video[] = [];

      snapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() } as Video);
      });

      return videos;
    } catch (error) {
      console.error('❌ Error getting videos:', error);
      throw error;
    }
  }

  async updateVideo(id: string, data: Partial<Video>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
      console.log('✅ Video updated:', id);
    } catch (error) {
      console.error('❌ Error updating video:', error);
      throw error;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      console.log('✅ Video deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting video:', error);
      throw error;
    }
  }
}

// ==================== EXAM MANAGEMENT ====================

export class ExamManager {
  private collectionName = 'exams';

  async addExam(examData: Omit<Exam, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...examData,
        createdAt: serverTimestamp()
      });
      console.log('✅ Exam added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding exam:', error);
      throw error;
    }
  }

  async getExams(grade?: '1' | '2' | '3'): Promise<Exam[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (grade) {
        q = query(
          collection(db, this.collectionName),
          where('grade', '==', grade),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const exams: Exam[] = [];

      snapshot.forEach((doc) => {
        exams.push({ id: doc.id, ...doc.data() } as Exam);
      });

      return exams;
    } catch (error) {
      console.error('❌ Error getting exams:', error);
      throw error;
    }
  }

  async updateExam(id: string, data: Partial<Exam>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
      console.log('✅ Exam updated:', id);
    } catch (error) {
      console.error('❌ Error updating exam:', error);
      throw error;
    }
  }

  async deleteExam(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      console.log('✅ Exam deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting exam:', error);
      throw error;
    }
  }
}

// ==================== NOTE MANAGEMENT ====================

export class NoteManager {
  private collectionName = 'notes';

  async addNote(noteData: Omit<Note, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...noteData,
        createdAt: serverTimestamp()
      });
      console.log('✅ Note added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding note:', error);
      throw error;
    }
  }

  async getNotes(grade?: '1' | '2' | '3'): Promise<Note[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (grade) {
        q = query(
          collection(db, this.collectionName),
          where('grade', '==', grade),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const notes: Note[] = [];

      snapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as Note);
      });

      return notes;
    } catch (error) {
      console.error('❌ Error getting notes:', error);
      throw error;
    }
  }

  async updateNote(id: string, data: Partial<Note>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
      console.log('✅ Note updated:', id);
    } catch (error) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      console.log('✅ Note deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }
}

// ==================== MATERIAL MANAGEMENT ====================

export class MaterialManager {
  private collectionName = 'materials';

  async addMaterial(
    materialData: Omit<Material, 'id' | 'createdAt' | 'fileUrl'>,
    file: File
  ): Promise<string> {
    try {
      // Upload file to Firebase Storage
      const fileRef = storageRef(
        storage,
        `materials/${Date.now()}_${file.name}`
      );
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Add material document to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...materialData,
        fileUrl,
        createdAt: serverTimestamp()
      });

      console.log('✅ Material added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding material:', error);
      throw error;
    }
  }

  async getMaterials(grade?: '1' | '2' | '3'): Promise<Material[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (grade) {
        q = query(
          collection(db, this.collectionName),
          where('grade', '==', grade),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const materials: Material[] = [];

      snapshot.forEach((doc) => {
        materials.push({ id: doc.id, ...doc.data() } as Material);
      });

      return materials;
    } catch (error) {
      console.error('❌ Error getting materials:', error);
      throw error;
    }
  }

  async updateMaterial(id: string, data: Partial<Material>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
      console.log('✅ Material updated:', id);
    } catch (error) {
      console.error('❌ Error updating material:', error);
      throw error;
    }
  }

  async deleteMaterial(id: string, fileUrl: string): Promise<void> {
    try {
      // Delete file from Storage
      const fileRef = storageRef(storage, fileUrl);
      await deleteObject(fileRef);

      // Delete document from Firestore
      await deleteDoc(doc(db, this.collectionName, id));
      console.log('✅ Material deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting material:', error);
      throw error;
    }
  }
}

// ==================== TESTIMONIAL MANAGEMENT ====================

export class TestimonialManager {
  private collectionName = 'testimonials';

  async addTestimonial(
    testimonialData: Omit<Testimonial, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...testimonialData,
        createdAt: serverTimestamp()
      });
      console.log('✅ Testimonial added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding testimonial:', error);
      throw error;
    }
  }

  async getTestimonials(approvedOnly: boolean = false): Promise<Testimonial[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (approvedOnly) {
        q = query(
          collection(db, this.collectionName),
          where('approved', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const testimonials: Testimonial[] = [];

      snapshot.forEach((doc) => {
        testimonials.push({ id: doc.id, ...doc.data() } as Testimonial);
      });

      return testimonials;
    } catch (error) {
      console.error('❌ Error getting testimonials:', error);
      throw error;
    }
  }

  async approveTestimonial(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, { approved: true });
      console.log('✅ Testimonial approved:', id);
    } catch (error) {
      console.error('❌ Error approving testimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      console.log('✅ Testimonial deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting testimonial:', error);
      throw error;
    }
  }
}

// ==================== STATISTICS ====================

export class DashboardStats {
  async getStats() {
    try {
      const [videos, exams, notes, materials, testimonials] = await Promise.all([
        getDocs(collection(db, 'videos')),
        getDocs(collection(db, 'exams')),
        getDocs(collection(db, 'notes')),
        getDocs(collection(db, 'materials')),
        getDocs(collection(db, 'testimonials'))
      ]);

      // Get students count
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'student'))
      );

      return {
        totalVideos: videos.size,
        totalExams: exams.size,
        totalNotes: notes.size,
        totalMaterials: materials.size,
        totalTestimonials: testimonials.size,
        totalStudents: usersSnapshot.size
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }
}

// Export instances
export const dashboardAuth = new DashboardAuth();
export const videoManager = new VideoManager();
export const examManager = new ExamManager();
export const noteManager = new NoteManager();
export const materialManager = new MaterialManager();
export const testimonialManager = new TestimonialManager();
export const dashboardStats = new DashboardStats();
