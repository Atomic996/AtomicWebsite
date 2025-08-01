document.addEventListener('DOMContentLoaded', () => {
    // العناصر الأساسية
    const elements = {
        carouselWrapper: document.getElementById('arc-carousel'),
        playBioButton: document.getElementById('play-bio'),
        bioTextElement: document.getElementById('bio-text'),
        backToTopBtn: document.getElementById('backToTopBtn'),
        mainHeader: document.querySelector('.main-header'),
        currentYearSpan: document.getElementById('currentYear'),
        threejsBackground: document.getElementById('threejs-background'),
    };

    // تحديث سنة الحقوق
    if (elements.currentYearSpan) {
        elements.currentYearSpan.textContent = new Date().getFullYear();
    }

    // زر العودة للأعلى
    const setupBackToTop = () => {
        if (!elements.backToTopBtn || !elements.mainHeader) return;

        window.addEventListener('scroll', () => {
            elements.backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
            elements.mainHeader.classList.toggle('scrolled', window.scrollY > 50);
        });

        elements.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };
    setupBackToTop();

    // خلفية الجسيمات باستخدام Three.js
    const setupThreeJS = () => {
        if (!elements.threejsBackground || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        elements.threejsBackground.appendChild(renderer.domElement);

        camera.position.z = 5;

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        let particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            transparent: true,
            blending: THREE.AdditiveBlending,
            color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()),
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

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
    };
    setupThreeJS();

    // تحويل النص إلى كلام
    const setupTextToSpeech = () => {
        if (!elements.playBioButton || !elements.bioTextElement) return;

        const bioText = elements.bioTextElement.textContent;
        const speechSynth = window.speechSynthesis;
        let currentUtterance = null;
        let isSpeaking = false;

        if (!speechSynth) {
            elements.playBioButton.textContent = 'متصفحك لا يدعم القراءة الصوتية';
            elements.playBioButton.disabled = true;
            return;
        }

        elements.playBioButton.addEventListener('click', () => {
            if (!isSpeaking) {
                currentUtterance = new SpeechSynthesisUtterance(bioText);
                currentUtterance.lang = 'ar-SA';
                currentUtterance.pitch = 1;
                currentUtterance.rate = 1;

                currentUtterance.onstart = () => {
                    isSpeaking = true;
                    elements.playBioButton.innerHTML = 'إيقاف السيرة الذاتية <i class="fas fa-pause"></i>';
                };

                currentUtterance.onend = () => {
                    isSpeaking = false;
                    elements.playBioButton.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                };

                speechSynth.speak(currentUtterance);
            } else {
                speechSynth.cancel();
                isSpeaking = false;
                elements.playBioButton.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
            }
        });
    };
    setupTextToSpeech();

    // الكاروسيل الدائري ثلاثي الأبعاد مع تبديل الأيقونات
    const setupArcCarousel = () => {
        if (!elements.carouselWrapper) return;

        const items = elements.carouselWrapper.querySelectorAll('.carousel-item');
        const totalItems = items.length;
        const radius = 200;
        const angleIncrement = (2 * Math.PI) / totalItems;
        let currentIndex = 0;
        let autoRotateInterval;

        const positionItems = () => {
            items.forEach((item, index) => {
                const angle = index * angleIncrement;
                const x = radius * Math.sin(angle);
                const z = radius * Math.cos(angle);
                item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${angle * (180 / Math.PI)}deg)`;
                item.style.opacity = index === currentIndex ? '1' : '0.3'; // تقليل الشفافية للأيقونات غير النشطة
                item.style.transition = 'opacity 0.5s ease';
            });
        };

        const rotateToIndex = (index) => {
            currentIndex = (index + totalItems) % totalItems; // التأكد من البقاء في النطاق
            positionItems();
        };

        const startAutoRotate = () => {
            autoRotateInterval = setInterval(() => {
                rotateToIndex(currentIndex + 1);
            },  2000); // تبديل كل 3 ثوانٍ
        };

        const stopAutoRotate = () => {
            clearInterval(autoRotateInterval);
        };

        positionItems();
        startAutoRotate();

        let isDragging = false;
        let startX, startRotation = 0;
        const maxRotation = 45;

        const updateRotation = (clientX) => {
            const rect = elements.carouselWrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const offsetX = (clientX - centerX) / rect.width;
            const rotation = offsetX * maxRotation;
            elements.carouselWrapper.style.transform = `rotateY(${rotation}deg)`;
        };

        // أحداث الفأرة
        elements.carouselWrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startRotation = parseFloat(getComputedStyle(elements.carouselWrapper).transform.split(',')[5]) || 0;
            stopAutoRotate(); // إيقاف التبديل التلقائي أثناء السحب
            elements.carouselWrapper.classList.add('active');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateRotation(e.clientX);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            elements.carouselWrapper.classList.remove('active');
            startAutoRotate(); // إعادة تشغيل التبديل التلقائي
        });

        // أحداث اللمس
        elements.carouselWrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startRotation = parseFloat(getComputedStyle(elements.carouselWrapper).transform.split(',')[5]) || 0;
            e.preventDefault();
            stopAutoRotate(); // إيقاف التبديل التلقائي أثناء اللمس
            elements.carouselWrapper.classList.add('active');
        }, { passive: false });

        elements.carouselWrapper.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            updateRotation(e.touches[0].clientX);
        }, { passive: false });

        elements.carouselWrapper.addEventListener('touchend', () => {
            isDragging = false;
            elements.carouselWrapper.classList.remove('active');
            startAutoRotate(); // إعادة تشغيل التبديل التلقائي
        });

        // تحسين التفاعل عند التحويم/اللمس
        items.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                item.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
                stopAutoRotate(); // إيقاف عند التحويم
            });
            item.addEventListener('mouseleave', () => {
                const angle = parseInt(item.dataset.index) * angleIncrement;
                const x = radius * Math.sin(angle);
                const z = radius * Math.cos(angle);
                item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${angle * (180 / Math.PI)}deg)`;
                startAutoRotate(); // إعادة التشغيل عند الخروج
            });
            item.addEventListener('touchstart', () => {
                item.style.transform = 'scale(1.1) translateZ(50px)';
                item.style.zIndex = '10';
                stopAutoRotate();
            });
            item.addEventListener('touchend', () => {
                const angle = parseInt(item.dataset.index) * angleIncrement;
                const x = radius * Math.sin(angle);
                const z = radius * Math.cos(angle);
                item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${angle * (180 / Math.PI)}deg)`;
                item.style.zIndex = '1';
                startAutoRotate();
            });
        });

        window.addEventListener('resize', positionItems);
    };
    setupArcCarousel();
});
