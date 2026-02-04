import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const authMessage = document.getElementById('authMessage');
function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
}
function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    googleLoginBtn.disabled = isLoading;
    loginBtn.classList.toggle('loading', isLoading);
}
async function createUserProfile(uid, email, name) {
    const role = email === 'mohamednaser@gmail.com' ? 'teacher' : 'student';
    const userDoc = {
        uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), userDoc);
    return userDoc;
}
async function handleLogin(email, password) {
    try {
        setLoading(true);
        let userCredential;
        try {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        }
        catch (signInError) {
            if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password') {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await createUserProfile(userCredential.user.uid, email, email.split('@')[0]);
                showMessage('تم إنشاء حسابك بنجاح!', 'success');
            }
            else {
                throw signInError;
            }
        }
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists()) {
            await createUserProfile(userCredential.user.uid, email, email.split('@')[0]);
        }
        const userData = userDoc.data();
        const redirectUrl = userData.role === 'teacher' ? 'dashboard.html' : 'profile.html';
        console.log('Redirecting to:', redirectUrl);
        console.log('Current location:', window.location.href);
        showMessage('تم تسجيل الدخول بنجاح!', 'success');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
    }
    catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'حدث خطأ أثناء تسجيل الدخول', 'error');
    }
    finally {
        setLoading(false);
    }
}
async function handleGoogleLogin() {
    try {
        setLoading(true);
        const result = await signInWithPopup(auth, googleProvider);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            await createUserProfile(result.user.uid, result.user.email || '', result.user.displayName || 'مستخدم');
        }
        const userData = userDoc.data();
        const redirectUrl = userData.role === 'teacher' ? 'dashboard.html' : 'profile.html';
        showMessage('تم تسجيل الدخول بنجاح!', 'success');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
    }
    catch (error) {
        console.error('Google login error:', error);
        showMessage('حدث خطأ أثناء تسجيل الدخول بواسطة Google', 'error');
    }
    finally {
        setLoading(false);
    }
}
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
        showMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    handleLogin(email, password);
});
googleLoginBtn?.addEventListener('click', handleGoogleLogin);
const passwordToggle = document.querySelector('[data-toggle-password]');
passwordToggle?.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    passwordToggle.setAttribute('aria-label', type === 'password' ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
});
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('login.html')) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const redirectUrl = userData.role === 'teacher' ? 'dashboard.html' : 'profile.html';
            window.location.href = redirectUrl;
        }
    }
});
