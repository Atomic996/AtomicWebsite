document.addEventListener('DOMContentLoaded', () => {
    // تسجيل إضافات GSAP
    gsap.registerPlugin(MotionPathPlugin);

    // عناصر الكاروسيل
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = gsap.utils.toArray('.carousel-item');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const carouselDotsContainer = document.querySelector('.carousel-dots');

    // إعدادات الكاروسيل
    const numItems = carouselItems.length;
    const radius = 650; // نصف قطر الدوران
    const arcAngle = 100; // زاوية القوس الذي تحتله العناصر
    const itemRotationOffset = 10; // تعويض لدوران العناصر
    const maxRotationSensitivity = 40; // أقصى حساسية لدوران الكاروسيل بالماوس

    let currentIndex = 0; // تتبع العنصر النشط (للنقاط والأزرار)

    // تهيئة مواقع العناصر وإنشاء نقاط التنقل
    function setupCarouselItems() {
        const angleStep = arcAngle / (numItems - 1); // الزاوية بين كل عنصر
        const startAngle = -arcAngle / 2; // زاوية البدء

        carouselItems.forEach((item, i) => {
            const currentAngle = startAngle + (i * angleStep);
            const radAngle = gsap.utils.degToRad(currentAngle);

            gsap.set(item, {
                x: Math.sin(radAngle) * radius,
                y: Math.cos(radAngle) * radius - radius,
                z: Math.cos(radAngle) * -radius,
                rotationY: currentAngle + itemRotationOffset,
                scale: 1 - (Math.abs(currentAngle) / (arcAngle / 2)) * 0.3,
                opacity: 1 - (Math.abs(currentAngle) / (arcAngle / 2)) * 0.4,
                transformOrigin: "center center",
                pointerEvents: "auto",
                zIndex: Math.round(100 - Math.abs(currentAngle))
            });

            // إنشاء نقاط التنقل
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            dot.dataset.index = i;
            carouselDotsContainer.appendChild(dot);
            dot.addEventListener('click', () => {
                goToItem(i);
            });
        });
        updateDots(); // تحديث حالة النقاط الأولية
    }

    // تحديث دوران الكاروسيل بناءً على حركة الماوس/اللمس
    function updateCarouselRotation(normalizedX) {
        gsap.to(carouselWrapper, {
            rotationY: normalizedX * maxRotationSensitivity,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // الانتقال إلى عنصر معين (لأزرار التنقل والنقاط)
    // لاحظ: هذه الوظيفة حالياً فقط تحدث النقاط ولا تغير دوران الكاروسيل
    // ثلاثي الأبعاد بشكل جذري، حيث أن الدوران الرئيسي يتم بالماوس.
    // لتغيير دوران الكاروسيل بواسطة الأزرار، سيتطلب ذلك إعادة هيكلة
    // أكثر تعقيداً لمنطق الـ GSAP الحالي.
    function goToItem(index) {
        currentIndex = index;
        updateDots();
        // يمكنك هنا إضافة تأثيرات بصرية أخرى للعنصر المحدد إذا أردت
        // مثلاً: تكبير العنصر النشط مؤقتًا أو تغيير توهجه
    }

    // تحديث حالة النقاط النشطة
    function updateDots() {
        gsap.utils.toArray('.carousel-dot').forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // تهيئة الكاروسيل
    setupCarouselItems();

    // أحداث الماوس للكاروسيل
    carouselContainer.addEventListener('mousemove', (e) => {
        const rect = carouselContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const normalizedX = (mouseX / rect.width) * 2 - 1; // تحويل الإحداثي إلى نطاق -1 إلى 1
        updateCarouselRotation(normalizedX);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        gsap.to(carouselWrapper, {
            rotationY: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.7)"
        });
    });

    // أحداث اللمس للكاروسيل
    carouselContainer.addEventListener('touchmove', (e) => {
        e.preventDefault(); // لمنع التمرير الافتراضي للصفحة
        const rect = carouselContainer.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const normalizedX = (touchX / rect.width) * 2 - 1;
        updateCarouselRotation(normalizedX);
    });

    carouselContainer.addEventListener('touchend', () => {
        gsap.to(carouselWrapper, {
            rotationY: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.7)"
        });
    });

    // أحداث أزرار التنقل (للكاروسيل)
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + numItems) % numItems;
        goToItem(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % numItems;
        goToItem(currentIndex);
    });

    // تحديث سنة حقوق النشر في الفوتر
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Intersection Observer للرسوم المتحركة عند التمرير
    const animateOnScroll = (elements, animationProps) => {
        elements.forEach(el => {
            // إعداد الحالة الأولية مخفية باستخدام gsap.set
            gsap.set(el, { opacity: 0, y: animationProps.y || 0, x: animationProps.x || 0 }); 

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // تشغيل الرسوم المتحركة عند دخول العنصر إطار العرض
                        gsap.to(el, {
                            opacity: 1,
                            y: 0,
                            x: 0,
                            duration: animationProps.duration || 1,
                            ease: animationProps.ease || "power2.out",
                            stagger: animationProps.stagger || 0 // لتأثير التتابع إذا كان موجوداً
                        });
                        observer.unobserve(el); // إيقاف المراقبة بعد تشغيل الرسوم المتحركة مرة واحدة
                    }
                });
            }, {
                threshold: animationProps.threshold || 0.2 // عندما يكون 20% من العنصر مرئيًا
            });
            observer.observe(el); // بدء مراقبة العنصر
        });
    };

    // تطبيق Intersection Observer على العناصر المستهدفة
    animateOnScroll(gsap.utils.toArray('.section-title'), { y: -30, duration: 1, ease: "bounce.out" });
    animateOnScroll(gsap.utils.toArray('.carousel-item'), { y: 50, stagger: 0.2, duration: 1, ease: "power3.out" });
    animateOnScroll(gsap.utils.toArray('.bio-content p'), { y: 20, stagger: 0.2, duration: 0.8, ease: "power2.out" });


    // Header الديناميكي (يتغير عند التمرير)
    const mainHeader = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) { // أضف الفئة 'scrolled' إذا كان التمرير أكبر من 100 بكسل
            mainHeader.classList.add('scrolled');
        } else { // أزل الفئة إذا عاد التمرير إلى الأعلى
            mainHeader.classList.remove('scrolled');
        }
    });

    // زر العودة للأعلى
    const backToTopBtn = document.getElementById('backToTopBtn');

    // إظهار/إخفاء الزر عند التمرير
    window.onscroll = function() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };

    // عند النقر على الزر، انتقل إلى أعلى الصفحة
    backToTopBtn.addEventListener('click', () => {
        document.body.scrollTop = 0; // لمتصفح سفاري
        document.documentElement.scrollTop = 0; // لمتصفحات كروم، فايرفوكس، IE، أوبرا
    });
});
