document.addEventListener('DOMContentLoaded', () => {
    // تحديد العناصر الأساسية في الصفحة
    const carouselContainer = document.querySelector('.carousel-container');
    const playBioButton = document.getElementById('play-bio');
    const bioTextElement = document.getElementById('bio-text');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const mainHeader = document.querySelector('.main-header');
    const neonTitles = document.querySelectorAll('.neon-title, .section-title, .signature span');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const mainContent = document.getElementById('main-content');
    const currentYearSpan = document.getElementById('currentYear');

    // تحديث سنة الحقوق تلقائيًا
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // إخفاء الـ Skeleton Loader وإظهار المحتوى بعد التحميل
    setTimeout(() => {
        if (skeletonLoader) skeletonLoader.classList.add('hidden');
        if (mainContent) mainContent.style.display = 'block';
    }, 1500); // إظهار المحتوى بعد 1.5 ثانية (يمكن تعديل المدة)


    // ----------------------------------------------------
    // وظيفة تبديل الألوان (الليل/النهار) وتأثير النيون
    // ----------------------------------------------------
    function updateColorsBasedOnTime() {
        const date = new Date();
        const hour = date.getHours(); // الساعة الحالية (0-23)

        let accentPrimary, accentPrimaryRgb;
        if (hour >= 6 && hour < 18) { // النهار (من 6 صباحًا إلى 6 مساءً)
            accentPrimary = '#00A6ED'; // أزرق
            accentPrimaryRgb = '0, 166, 237';
        } else { // الليل (من 6 مساءً إلى 6 صباحًا)
            accentPrimary = '#8A2BE2'; // بنفسجي
            accentPrimaryRgb = '138, 43, 226';
        }

        // تحديث متغيرات CSS
        document.documentElement.style.setProperty('--accent-primary', accentPrimary);
        document.documentElement.style.setProperty('--accent-primary-rgb', accentPrimaryRgb);
        document.documentElement.style.setProperty('--neon-glow', `0 0 10px ${accentPrimary}, 0 0 20px ${accentPrimary}`);
        document.documentElement.style.setProperty('--deep-glow', `0 0 15px ${accentPrimary}, 0 0 30px ${accentPrimary}`);

        // Update particle color if Three.js is loaded
        // This part assumes 'particlesMaterial' is globally accessible or passed
        // For simplicity, we'll ensure it's updated in the Three.js section itself when material is defined.
        // Or, call a specific update function for particles if it exists
        if (window.updateParticleColor && typeof window.updateParticleColor === 'function') {
            window.updateParticleColor();
        }
    }

    // استدعاء الوظيفة عند تحميل الصفحة وكل دقيقة لتحديث الألوان
    updateColorsBasedOnTime();
    setInterval(updateColorsBasedOnTime, 60 * 1000); // تحديث كل دقيقة (60 ثانية * 1000 مللي ثانية)


    // ----------------------------------------------------
    // وظيفة Text-to-Speech (تحويل النص إلى كلام)
    // ----------------------------------------------------
    if (playBioButton && bioTextElement) {
        const bioText = bioTextElement.textContent;
        let speechSynth = window.speechSynthesis;
        let currentUtterance = null;
        let isSpeaking = false;

        if ('speechSynthesis' in window) {
            playBioButton.addEventListener('click', () => {
                if (!isSpeaking) {
                    currentUtterance = new SpeechSynthesisUtterance(bioText);
                    currentUtterance.lang = 'ar-SA';
                    currentUtterance.pitch = 1;
                    currentUtterance.rate = 1;

                    currentUtterance.onstart = () => {
                        isSpeaking = true;
                        playBioButton.innerHTML = 'إيقاف السيرة الذاتية <i class="fas fa-pause"></i>';
                        playBioButton.classList.add('playing');
                    };

                    currentUtterance.onend = () => {
                        isSpeaking = false;
                        playBioButton.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                        playBioButton.classList.remove('playing');
                    };

                    currentUtterance.onerror = (event) => {
                        console.error('Speech synthesis error:', event.error);
                        isSpeaking = false;
                        playBioButton.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                        playBioButton.classList.remove('playing');
                        alert('حدث خطأ أثناء تشغيل السيرة الذاتية. قد لا يكون متصفحك يدعم هذه الميزة أو لا يتوفر صوت للغة العربية.');
                    };

                    speechSynth.speak(currentUtterance);
                } else {
                    speechSynth.cancel();
                }
            });
        } else {
            playBioButton.textContent = 'متصفحك لا يدعم القراءة الصوتية';
            playBioButton.disabled = true;
            playBioButton.classList.add('disabled');
        }
    }

    // ----------------------------------------------------
    // زر العودة للأعلى (Back To Top Button)
    // ----------------------------------------------------
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }

            if (mainHeader) {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('scrolled');
                } else {
                    mainHeader.classList.remove('scrolled');
                }
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ----------------------------------------------------
    // تأثير خلفية الجسيمات المتحركة باستخدام Three.js
    // ----------------------------------------------------
    const threejsBackground = document.getElementById('threejs-background');
    if (threejsBackground && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        threejsBackground.appendChild(renderer.domElement);

        camera.position.z = 5;

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        let particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            transparent: true,
            blending: THREE.AdditiveBlending,
            color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim())
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Function to update particle color based on CSS variable
        window.updateParticleColor = () => {
            if (particlesMaterial) {
                particlesMaterial.color.set(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim());
            }
        };

        const animate = () => {
            requestAnimationFrame(animate);

            particlesMesh.rotation.y += 0.0001;
            particlesMesh.rotation.x += 0.00005;
            particlesMesh.position.z -= 0.001;

            if (particlesMesh.position.z < -5) {
                particlesMesh.position.z = 5;
            }

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ----------------------------------------------------
    // الكاروسيل الأفقي (Horizontal Carousel)
    // ----------------------------------------------------
    if (carouselContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselContainer.classList.add('active');
            startX = e.pageX - carouselContainer.offsetLeft;
            scrollLeft = carouselContainer.scrollLeft;
        });

        carouselContainer.addEventListener('mouseleave', () => {
            isDown = false;
            carouselContainer.classList.remove('active');
        });

        carouselContainer.addEventListener('mouseup', () => {
            isDown = false;
            carouselContainer.classList.remove('active');
        });

        carouselContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselContainer.offsetLeft;
            const walk = (x - startX) * 2;
            carouselContainer.scrollLeft = scrollLeft - walk;
        });
    }
});
