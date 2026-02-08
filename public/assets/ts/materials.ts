import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig, User, Material } from './firebase-config';
import './toast-types';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser: User | null = null;

const gradeContainers: { [key: string]: HTMLElement | null } = {
  '1': document.getElementById('materialsGrade1'),
  '2': document.getElementById('materialsGrade2'),
  '3': document.getElementById('materialsGrade3')
};

const emptyState = document.getElementById('emptyState') as HTMLElement;

async function loadMaterials() {
  try {
    // Get materials for each grade
    ['1', '2', '3'].forEach(async (grade) => {
      const container = gradeContainers[grade];
      if (!container) {
        return;
      }

      container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري تحميل المذكرات...</span></div>';

      try {
        const materialsQuery = query(
          collection(db, 'materials'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(materialsQuery);
        
        // Filter by grade
        const gradeMaterials = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Material))
          .filter((m) => m.grade === grade);

        if (gradeMaterials.length === 0) {
          container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem; grid-column: 1 / -1;">لا توجد مذكرات لهذا الصف حالياً</p>';
          return;
        }

        container.innerHTML = '';
        container.classList.add('active');

        gradeMaterials.forEach((material) => {
          const card = createMaterialCard(material);
          container.appendChild(card);
        });

      } catch (error) {
        console.error(`Error loading materials for grade ${grade}:`, error);
        container.innerHTML = '<div class="error-state"><p>حدث خطأ أثناء تحميل المذكرات</p></div>';
      }
    });

  } catch (error) {
    console.error('Error loading materials:', error);
    if (emptyState) {
      emptyState.innerHTML = '<p>حدث خطأ أثناء تحميل المذكرات</p>';
      emptyState.style.display = 'flex';
    }
  }
}

function createMaterialCard(material: Material): HTMLElement {
  const card = document.createElement('article');
  card.className = 'material-card';
  card.setAttribute('role', 'listitem');

  const createdDate = new Date(material.createdAt).toLocaleDateString('ar-EG');

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
      <h3 style="color: #f1f5f9; font-size: 1.1rem; margin: 0;">📚 ${material.title}</h3>
    </div>
    ${material.description ? `<p style="color: #94a3b8; margin: 0.5rem 0; font-size: 0.95rem;">${material.description}</p>` : ''}
    <div style="color: #64748b; font-size: 0.85rem; margin-top: 1rem;">
      <p style="margin: 0.25rem 0;">📅 ${createdDate}</p>
      ${material.fileSize ? `<p style="margin: 0.25rem 0;">📦 ${material.fileSize}</p>` : ''}
    </div>
    <button class="btn" style="width: 100%; margin-top: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 0.75rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;" onclick="downloadMaterial('${material.id}', '${material.title}')">
      📥 تحميل المذكرة
    </button>
  `;

  return card;
}

async function downloadMaterial(materialId: string, _title?: string) {
  if (!currentUser) {
    (window as any).showToast('يجب تسجيل الدخول لتحميل المذكرات', 'warning');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);
    return;
  }

  try {
    // Get the material document to get the file URL
    const materialRef = doc(db, 'materials', materialId);
    const materialSnap = await getDoc(materialRef);

    if (!materialSnap.exists()) {
      (window as any).showToast('المذكرة غير موجودة', 'error');
      return;
    }

    const material = materialSnap.data() as Material;
    
    if (material.fileUrl) {
      // Open the file URL in a new tab
      window.open(material.fileUrl, '_blank');
      (window as any).showToast('جاري تحميل المذكرة...', 'success');
    } else {
      (window as any).showToast('رابط التحميل غير متاح', 'error');
    }
  } catch (error) {
    console.error('Error downloading material:', error);
    (window as any).showToast('حدث خطأ أثناء تحميل المذكرة', 'error');
  }
}

async function checkAuth() {
  return new Promise<User | null>((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user logged in, still load materials but in read-only mode
        currentUser = null;
        loadMaterials();
        resolve(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          currentUser = userDoc.data() as User;
        }
      } catch (error) {
        console.warn('Error loading user data:', error);
      }

      loadMaterials();
      resolve(currentUser);
    });
  });
}

// Initialize
checkAuth();

// Make downloadMaterial globally accessible
(window as any).downloadMaterial = downloadMaterial;
