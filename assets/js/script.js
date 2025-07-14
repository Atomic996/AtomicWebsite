document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(MotionPathPlugin);

    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = gsap.utils.toArray('.carousel-item');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const carouselDotsContainer = document.querySelector('.carousel-dots');

    const numItems = carouselItems.length;
    
    // --- قيم تم تعديلها بشكل كبير لتجنب التداخل وإنشاء قوس شديد الانبساط ---
    const veryLargeRadius = 1500; // نصف قطر كبير جدًا لجعل القوس مسطحًا تقريبًا
    const veryWideArcAngle = 170; // زاوية واسعة جدًا (قريبة من 180 درجة لتبدو كخط مستقيم)
    // --- نهاية القيم المعدلة ---

    const maxRotationSensitivity = 40;
    let currentItemIndex = 0; // العنصر النشط حاليا

    function setupCarouselItems() {
        const angleStep = veryWideArcAngle / (numItems - 1);
        const startAngle = -veryWideArcAngle / 2;

        carouselItems.forEach((item, i) => {
            const currentAngle = startAngle + (i * angleStep);
            const radAngle = currentAngle * (Math.PI / 180); // تحويل الدرجات إلى راديان يدوياً

            gsap.set(item, {
                x: Math.sin(radAngle) * veryLargeRadius, // توزيع أفقي كبير
                y: 0, // لجعلها على خط أفقي مستقيم (لا يوجد ارتفاع أو انخفاض على القوس)
                z: Math.cos(radAngle) * -veryLargeRadius, // دفع العناصر البعيدة إلى الخلف بشكل كبير
                rotationY: currentAngle, // تدوير كل عنصر ليواجه مركز القوس
                scale: 1, // الحجم الكامل في البداية
                opacity: 1, // الشفافية الكاملة في البداية
                transformOrigin: "center center",
                pointerEvents: "auto",
                zIndex: Math.round(1000 - Math.abs(currentAngle)) // z-index أعلى للأقرب
            });
        });
    }

    // تحديث دوران الكاروسيل عند تحريك الماوس
    function updateCarouselRotation(normalizedX) {
        gsap.to(carouselWrapper, {
            rotationY: normalizedX * maxRotationSensitivity,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // دالة للانتقال إلى عنصر معين
    function goToItem(index) {
        if (index < 0) {
            currentItemIndex = numItems - 1;
        } else if (index >= numItems) {
            currentItemIndex = 0;
        } else {
            currentItemIndex = index;
        }

        // حساب الزاوية المستهدفة لتدوير الـ wrapper لجلب العنصر المحدد إلى المركز
        const angleStep = veryWideArcAngle / (numItems - 1);
        const startAngle = -veryWideArcAngle / 2;
        const targetAngle = -((angleStep) * currentItemIndex + startAngle);
        
        gsap.to(carouselWrapper, {
            rotationY: targetAngle,
            duration: 1.2, // مدة الانتقال بين العناصر
            ease: "power3.out",
            onUpdate: () => {
                carouselItems.forEach((item, i) => {
                    const currentWrapperRotationY = parseFloat(gsap.get(carouselWrapper, 'rotationY'));
                    // الزاوية المرئية لكل عنصر بالنسبة للمشاهد بعد دوران الـ wrapper
                    const itemVisualAngle = (angleStep * i + startAngle) - currentWrapperRotationY;

                    // تطبيق تأثيرات الـ scale والـ opacity بناءً على قرب العنصر من المركز المرئي
                    gsap.to(item, {
                        scale: 1 - (Math.abs(itemVisualAngle) / (veryWideArcAngle / 2)) * 0.4, // تقليل الحجم بشكل أقل حدة
                        opacity: 1 - (Math.abs(itemVisualAngle) / (veryWideArcAngle / 2)) * 0.6, // تقليل الشفافية بشكل أقل حدة
                        duration: 0.3 // انتقال سلس للحجم والشفافية
                    });
                });
            }
        });
        updateDots();
    }

    // إنشاء نقاط التنقل
    function createCarouselDots() {
        carouselDotsContainer.innerHTML = '';
        for (let i = 0; i < numItems; i++) {
            const dot = document.createElement('span');
            dot.classList.add('carousel-dot');
            if (i === currentItemIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => goToItem(i));
            carouselDotsContainer.appendChild(dot);
        }
    }

    // تحديث حالة النقاط
    function updateDots() {
        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            if (index === currentItemIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // تهيئة الكاروسيل عند التحميل
    setupCarouselItems();
    createCarouselDots();
    goToItem(0); // ابدأ بالعنصر الأول

    // أحداث الماوس
    carouselContainer.addEventListener('mousemove', (e) => {
        const rect = carouselContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const normalizedX = (mouseX / rect.width) * 2 - 1;
        updateCarouselRotation(normalizedX);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        goToItem(currentItemIndex); // العودة إلى العنصر الحالي عند مغادرة الماوس
    });

    // أحداث اللمس
    let touchStartX = 0;
    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    carouselContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = carouselContainer.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const normalizedX = (touchX / rect.width) * 2 - 1;
        updateCarouselRotation(normalizedX);
    });

    carouselContainer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance > 50) { // Swipe right
            goToItem(currentItemIndex - 1);
        } else if (swipeDistance < -50) { // Swipe left
            goToItem(currentItemIndex + 1);
        } else {
            goToItem(currentItemIndex); // ارجع إلى العنصر الحالي
        }
    });

    // أحداث أزرار التنقل
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToItem(currentItemIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToItem(currentItemIndex + 1);
        });
    }

    // تحديث سنة الحقوق
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // تأثيرات إضافية
    gsap.from('.carousel-item', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    gsap.from('.section-title', {
        opacity: 0,
        y: -30,
        duration: 1,
        ease: "bounce.out",
        delay: 0.3
    });

    gsap.from('.bio-content p', {
        opacity: 0,
        y: 20,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.8
    });
});
