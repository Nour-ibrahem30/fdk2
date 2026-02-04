import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');
navbarToggle?.addEventListener('click', () => {
    const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
    navbarToggle.setAttribute('aria-expanded', (!isExpanded).toString());
    navbarMenu?.classList.toggle('active');
});
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas)
        return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0x00d4ff });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    function animate() {
        requestAnimationFrame(animate);
        torusKnot.rotation.x += 0.01;
        torusKnot.rotation.y += 0.01;
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
function initAnimations() {
    gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    });
    gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });
    gsap.from('.hero-actions', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.6,
        ease: 'power3.out'
    });
    gsap.utils.toArray('.feature-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out'
        });
    });
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power3.out'
    });
    gsap.from('.about-image', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        },
        opacity: 0,
        x: 50,
        duration: 1,
        ease: 'power3.out'
    });
}
async function loadTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container)
        return;
    try {
        const testimonialsQuery = query(collection(db, 'testimonials'), limit(6));
        const snapshot = await getDocs(testimonialsQuery);
        if (snapshot.empty) {
            container.innerHTML = `
        <div class="empty-state">
          <p>لا توجد آراء متاحة حالياً</p>
        </div>
      `;
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((doc) => {
            const testimonial = doc.data();
            const card = document.createElement('article');
            card.className = 'testimonial-card';
            card.setAttribute('role', 'listitem');
            const stars = '⭐'.repeat(testimonial.rating);
            card.innerHTML = `
        <div class="testimonial-rating" aria-label="${testimonial.rating} من 5 نجوم">${stars}</div>
        <p class="testimonial-text">${testimonial.comment}</p>
        <div class="testimonial-header">
          <div class="testimonial-avatar" aria-hidden="true">👤</div>
          <div class="testimonial-info">
            <div class="testimonial-name">${testimonial.studentName}</div>
            <div class="testimonial-role">طالب</div>
          </div>
        </div>
      `;
            container.appendChild(card);
        });
        gsap.utils.toArray('.testimonial-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%'
                },
                opacity: 0,
                y: 30,
                duration: 0.6,
                delay: index * 0.1,
                ease: 'power3.out'
            });
        });
    }
    catch (error) {
        console.error('Error loading testimonials:', error);
        container.innerHTML = `
      <div class="error-state">
        <p>حدث خطأ أثناء تحميل الآراء</p>
      </div>
    `;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initAnimations();
    loadTestimonials();
});
