// Particles Background Animation
export function initParticlesBackground(canvasId: string = 'particles-bg'): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

    interface Particle {
        x: number;
        y: number;
        radius: number;
        vx: number;
        vy: number;
    }

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    function animate() {
      if (!ctx || !canvas) {
        return;
      }
        
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
}

// Add fade-in animation to elements
export function addFadeInAnimation(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    const el = element as HTMLElement;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay + (index * 100));
  });
}

// Add slide-in animation
export function addSlideInAnimation(selector: string, direction: 'left' | 'right' | 'up' | 'down' = 'up', delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    const el = element as HTMLElement;
    el.style.opacity = '0';
        
    switch (direction) {
    case 'left':
      el.style.transform = 'translateX(-50px)';
      break;
    case 'right':
      el.style.transform = 'translateX(50px)';
      break;
    case 'up':
      el.style.transform = 'translateY(30px)';
      break;
    case 'down':
      el.style.transform = 'translateY(-30px)';
      break;
    }
        
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(0, 0)';
    }, delay + (index * 100));
  });
}

// Add scale-in animation
export function addScaleInAnimation(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    const el = element as HTMLElement;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.9)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    }, delay + (index * 100));
  });
}

// Add hover lift effect
export function addHoverLiftEffect(selector: string): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    const el = element as HTMLElement;
    el.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translateY(-4px)';
      el.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
    });
        
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '';
    });
  });
}

// Initialize all animations on page load
export function initPageAnimations(): void {
  // Add particles background if canvas exists
  if (document.getElementById('particles-bg')) {
    initParticlesBackground('particles-bg');
  }
    
  // Add fade-in to main content
  addFadeInAnimation('.fade-in', 100);
    
  // Add slide-in to cards
  addSlideInAnimation('.slide-in', 'up', 200);
    
  // Add scale-in to buttons
  addScaleInAnimation('.scale-in', 300);
    
  // Add hover lift to cards
  addHoverLiftEffect('.hover-lift');
}

// Auto-initialize on DOM load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initPageAnimations();
  });
}
