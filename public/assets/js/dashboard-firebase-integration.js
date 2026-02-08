/**
 * Dashboard Firebase Integration
 * يحول Dashboard من localStorage إلى Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc,
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getStorage, 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// ⚠️ Firebase Configuration - استبدل بالبيانات الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyBxxx-REPLACE-WITH-YOUR-KEY",
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

console.log('🔥 Firebase Dashboard Integration loaded!');

// Export للاستخدام في الكود
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;

// ==================== AUTHENTICATION ====================

export async function checkFirebaseAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log('❌ No user logged in');
                resolve(null);
                return;
            }

            try {
                // Check if teacher
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('uid', '==', user.uid));
                const snapshot = await getDocs(q);
                
                if (snapshot.empty) {
                    console.log('❌ User not found in database');
                    resolve(null);
                    return;
                }

                const userData = snapshot.docs[0].data();
                
                if (userData.role !== 'teacher') {
                    console.log('❌ User is not a teacher');
                    resolve(null);
                    return;
                }

                console.log('✅ Teacher authenticated:', userData.name);
                resolve({ ...userData, firebaseUser: user });
            } catch (error) {
                console.error('❌ Error checking auth:', error);
                reject(error);
            }
        });
    });
}

// ==================== VIDEOS ====================

export async function getVideosFromFirebase(grade = null) {
    try {
        let q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
        
        if (grade) {
            q = query(collection(db, 'videos'), where('grade', '==', grade), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const videos = [];
        
        snapshot.forEach(doc => {
            videos.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${videos.length} videos from Firebase`);
        return videos;
    } catch (error) {
        console.error('❌ Error loading videos:', error);
        return [];
    }
}

export async function addVideoToFirebase(videoData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const docRef = await addDoc(collection(db, 'videos'), {
            ...videoData,
            createdBy: user.uid,
            createdAt: serverTimestamp()
        });

        console.log('✅ Video added to Firebase:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding video:', error);
        throw error;
    }
}

export async function deleteVideoFromFirebase(videoId) {
    try {
        await deleteDoc(doc(db, 'videos', videoId));
        console.log('✅ Video deleted from Firebase:', videoId);
    } catch (error) {
        console.error('❌ Error deleting video:', error);
        throw error;
    }
}

// ==================== EXAMS ====================

export async function getExamsFromFirebase(grade = null) {
    try {
        let q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        
        if (grade) {
            q = query(collection(db, 'exams'), where('grade', '==', grade), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const exams = [];
        
        snapshot.forEach(doc => {
            exams.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${exams.length} exams from Firebase`);
        return exams;
    } catch (error) {
        console.error('❌ Error loading exams:', error);
        return [];
    }
}

export async function addExamToFirebase(examData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const docRef = await addDoc(collection(db, 'exams'), {
            ...examData,
            createdBy: user.uid,
            createdAt: serverTimestamp()
        });

        console.log('✅ Exam added to Firebase:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding exam:', error);
        throw error;
    }
}

export async function deleteExamFromFirebase(examId) {
    try {
        await deleteDoc(doc(db, 'exams', examId));
        console.log('✅ Exam deleted from Firebase:', examId);
    } catch (error) {
        console.error('❌ Error deleting exam:', error);
        throw error;
    }
}

// ==================== NOTES ====================

export async function getNotesFromFirebase(grade = null) {
    try {
        let q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
        
        if (grade) {
            q = query(collection(db, 'notes'), where('grade', '==', grade), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const notes = [];
        
        snapshot.forEach(doc => {
            notes.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${notes.length} notes from Firebase`);
        return notes;
    } catch (error) {
        console.error('❌ Error loading notes:', error);
        return [];
    }
}

export async function addNoteToFirebase(noteData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const docRef = await addDoc(collection(db, 'notes'), {
            ...noteData,
            createdBy: user.uid,
            createdAt: serverTimestamp()
        });

        console.log('✅ Note added to Firebase:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding note:', error);
        throw error;
    }
}

export async function deleteNoteFromFirebase(noteId) {
    try {
        await deleteDoc(doc(db, 'notes', noteId));
        console.log('✅ Note deleted from Firebase:', noteId);
    } catch (error) {
        console.error('❌ Error deleting note:', error);
        throw error;
    }
}

// ==================== MATERIALS ====================

export async function getMaterialsFromFirebase(grade = null) {
    try {
        let q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
        
        if (grade) {
            q = query(collection(db, 'materials'), where('grade', '==', grade), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const materials = [];
        
        snapshot.forEach(doc => {
            materials.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${materials.length} materials from Firebase`);
        return materials;
    } catch (error) {
        console.error('❌ Error loading materials:', error);
        return [];
    }
}

export async function addMaterialToFirebase(materialData, file) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        // Upload file to Storage
        const fileRef = storageRef(storage, `materials/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(snapshot.ref);

        // Add document to Firestore
        const docRef = await addDoc(collection(db, 'materials'), {
            ...materialData,
            fileUrl,
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            createdBy: user.uid,
            createdAt: serverTimestamp()
        });

        console.log('✅ Material added to Firebase:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding material:', error);
        throw error;
    }
}

export async function deleteMaterialFromFirebase(materialId, fileUrl) {
    try {
        // Delete file from Storage
        if (fileUrl && fileUrl.includes('firebase')) {
            try {
                const fileRef = storageRef(storage, fileUrl);
                await deleteObject(fileRef);
            } catch (storageError) {
                console.warn('Could not delete file from storage:', storageError);
            }
        }

        // Delete document from Firestore
        await deleteDoc(doc(db, 'materials', materialId));
        console.log('✅ Material deleted from Firebase:', materialId);
    } catch (error) {
        console.error('❌ Error deleting material:', error);
        throw error;
    }
}

// ==================== TESTIMONIALS ====================

export async function getTestimonialsFromFirebase(approvedOnly = false) {
    try {
        let q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
        
        if (approvedOnly) {
            q = query(collection(db, 'testimonials'), where('approved', '==', true), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const testimonials = [];
        
        snapshot.forEach(doc => {
            testimonials.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${testimonials.length} testimonials from Firebase`);
        return testimonials;
    } catch (error) {
        console.error('❌ Error loading testimonials:', error);
        return [];
    }
}

export async function addTestimonialToFirebase(testimonialData) {
    try {
        const docRef = await addDoc(collection(db, 'testimonials'), {
            ...testimonialData,
            approved: false, // Needs teacher approval
            createdAt: serverTimestamp()
        });

        console.log('✅ Testimonial added to Firebase:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding testimonial:', error);
        throw error;
    }
}

export async function approveTestimonialInFirebase(testimonialId) {
    try {
        await updateDoc(doc(db, 'testimonials', testimonialId), {
            approved: true
        });
        console.log('✅ Testimonial approved:', testimonialId);
    } catch (error) {
        console.error('❌ Error approving testimonial:', error);
        throw error;
    }
}

export async function deleteTestimonialFromFirebase(testimonialId) {
    try {
        await deleteDoc(doc(db, 'testimonials', testimonialId));
        console.log('✅ Testimonial deleted from Firebase:', testimonialId);
    } catch (error) {
        console.error('❌ Error deleting testimonial:', error);
        throw error;
    }
}

// ==================== STATISTICS ====================

export async function getStatsFromFirebase() {
    try {
        const [videosSnap, examsSnap, notesSnap, materialsSnap, studentsSnap] = await Promise.all([
            getDocs(collection(db, 'videos')),
            getDocs(collection(db, 'exams')),
            getDocs(collection(db, 'notes')),
            getDocs(collection(db, 'materials')),
            getDocs(query(collection(db, 'users'), where('role', '==', 'student')))
        ]);

        const stats = {
            totalVideos: videosSnap.size,
            totalExams: examsSnap.size,
            totalNotes: notesSnap.size,
            totalMaterials: materialsSnap.size,
            totalStudents: studentsSnap.size
        };

        console.log('✅ Stats loaded from Firebase:', stats);
        return stats;
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        return {
            totalVideos: 0,
            totalExams: 0,
            totalNotes: 0,
            totalMaterials: 0,
            totalStudents: 0
        };
    }
}

// Make functions available globally
window.FirebaseDashboard = {
    checkAuth: checkFirebaseAuth,
    videos: {
        get: getVideosFromFirebase,
        add: addVideoToFirebase,
        delete: deleteVideoFromFirebase
    },
    exams: {
        get: getExamsFromFirebase,
        add: addExamToFirebase,
        delete: deleteExamFromFirebase
    },
    notes: {
        get: getNotesFromFirebase,
        add: addNoteToFirebase,
        delete: deleteNoteFromFirebase
    },
    materials: {
        get: getMaterialsFromFirebase,
        add: addMaterialToFirebase,
        delete: deleteMaterialFromFirebase
    },
    testimonials: {
        get: getTestimonialsFromFirebase,
        add: addTestimonialToFirebase,
        approve: approveTestimonialInFirebase,
        delete: deleteTestimonialFromFirebase
    },
    stats: {
        get: getStatsFromFirebase
    }
};

console.log('✅ Firebase Dashboard functions ready!');
console.log('📌 Use: window.FirebaseDashboard');
