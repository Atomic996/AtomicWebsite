document.addEventListener('DOMContentLoaded', () => {
    // تحديد العناصر الأساسية في الصفحة
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = Array.from(document.querySelectorAll('.carousel-item'));
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
    // استخدام setTimeout لمحاكاة وقت تحميل لضمان رؤية الـ loader
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

        // تحديد الألوان بناءً على الوقت
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

        // التحقق مما إذا كانت واجهة SpeechSynthesis متاحة
        if ('speechSynthesis' in window) {
            playBioButton.addEventListener('click', () => {
                if (!isSpeaking) {
                    currentUtterance = new SpeechSynthesisUtterance(bioText);
                    currentUtterance.lang = 'ar-SA'; // تعيين اللغة العربية
                    currentUtterance.pitch = 1;     // درجة الصوت (1 هو الافتراضي)
                    currentUtterance.rate = 1;       // سرعة الكلام (1 هو الافتراضي)

                    // عندما يبدأ الكلام
                    currentUtterance.onstart = () => {
                        isSpeaking = true;
                        playBioButton.innerHTML = 'إيقاف السيرة الذاتية <i class="fas fa-pause"></i>';
                        playBioButton.classList.add('playing');
                    };

                    // عندما يتوقف الكلام
                    currentUtterance.onend = () => {
                        isSpeaking = false;
                        playBioButton.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                        playBioButton.classList.remove('playing');
                    };

                    // عند حدوث خطأ
                    currentUtterance.onerror = (event) => {
                        console.error('Speech synthesis error:', event.error);
                        isSpeaking = false;
                        playBioButton.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                        playBioButton.classList.remove('playing');
                        alert('حدث خطأ أثناء تشغيل السيرة الذاتية. قد لا يكون متصفحك يدعم هذه الميزة أو لا يتوفر صوت للغة العربية.');
                    };

                    speechSynth.speak(currentUtterance);
                } else {
                    speechSynth.cancel(); // إيقاف الكلام الحالي
                }
            });
        } else {
            // إظهار رسالة إذا كان المتصفح لا يدعم SpeechSynthesis
            playBioButton.textContent = 'متصفحك لا يدعم القراءة الصوتية';
            playBioButton.disabled = true;
            playBioButton.classList.add('disabled');
        }
    }

    // ----------------------------------------------------
    // زر العودة للأعلى (Back To Top Button)
    // ----------------------------------------------------
    if (backToTopBtn) {
        // إظهار/إخفاء الزر عند التمرير
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // يظهر الزر بعد التمرير 300 بكسل
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }

            // إضافة/إزالة فئة 'scrolled' للرأس لتغيير نمطه عند التمرير
            if (mainHeader) {
                if (window.scrollY > 50) { // بعد التمرير 50 بكسل
                    mainHeader.classList.add('scrolled');
                } else {
                    mainHeader.classList.remove('scrolled');
                }
            }
        });

        // عند النقر على الزر، قم بالتمرير إلى أعلى الصفحة بسلاسة
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // تمرير سلس
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
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true للسماح بالخلفية الشفافة (CSS)
        renderer.setSize(window.innerWidth, window.innerHeight);
        threejsBackground.appendChild(renderer.domElement);

        camera.position.z = 5;

        // إنشاء الجسيمات
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000; // عدد الجسيمات
        const posArray = new Float32Array(particlesCount * 3); // x, y, z لكل جسيم

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10; // توزيع الجسيمات من -5 إلى 5
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // المواد (Material) للجسيمات
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015, // حجم الجسيمات
            transparent: true,
            blending: THREE.AdditiveBlending, // وضع المزج لإعطاء تأثير توهج
            color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()) // لون الجسيمات من متغير CSS
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // وظيفة تحديث الألوان للجسيمات (عندما يتغير accent-primary)
        function updateParticleColor() {
            if (particlesMaterial) {
                particlesMaterial.color.set(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim());
            }
        }
        // مراقبة التغييرات في متغير CSS لتحديث لون الجسيمات
        const observer = new MutationObserver(() => {
            updateParticleColor();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });


        // الرسوم المتحركة
        const animate = () => {
            requestAnimationFrame(animate);

            // تحريك الجسيمات
            particlesMesh.rotation.y += 0.0001; // دوران بطيء حول محور Y
            particlesMesh.rotation.x += 0.00005; // دوران بطيء حول محور X
            particlesMesh.position.z -= 0.001; // حركة بطيئة نحو الكاميرا

            // إعادة تعيين موضع الجسيمات عند تجاوزها للكاميرا لإنشاء حلقة لا نهائية
            if (particlesMesh.position.z < -5) {
                particlesMesh.position.z = 5;
            }

            renderer.render(scene, camera);
        };
        animate();

        // التعامل مع تغيير حجم النافذة
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }


    // ----------------------------------------------------
    // الكاروسيل الأفقي (Horizontal Carousel) - لا يستخدم GSAP MotionPath
    // ----------------------------------------------------
    if (carouselContainer && carouselWrapper && carouselItems.length > 0) {
        let currentScroll = 0;
        const scrollAmount = 250; // مقدار التمرير لكل نقرة

        // جعل الكاروسيل قابل للتمرير الأفقي بالماوس
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
            const walk = (x - startX) * 2; // سرعة التمرير
            carouselContainer.scrollLeft = scrollLeft - walk;
        });

        // Smooth scroll to an item (for potential future navigation buttons or dots)
        function scrollToItem(index) {
            if (index < 0 || index >= carouselItems.length) return;
            const item = carouselItems[index];
            carouselContainer.scrollTo({
                left: item.offsetLeft - (carouselContainer.offsetWidth / 2) + (item.offsetWidth / 2),
                behavior: 'smooth'
            });
        }

        // ملاحظة: تم إزالة كود GSAP MotionPathPlugin هنا لأن الكاروسيل أصبح أفقيًا بسيطًا
        // إذا كنت ترغب في تأثير قوس معقد، يمكننا إعادة إضافته مع مكتبة GSAP.
    }
});
