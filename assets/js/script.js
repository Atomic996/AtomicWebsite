document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(MotionPathPlugin);

    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = gsap.utils.toArray('.carousel-item');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const carouselDotsContainer = document.querySelector('.carousel-dots');

    const numItems = carouselItems.length;
    // تم تعديل قيمة radius لجعل العناصر أقرب وأكثر وضوحًا
    const radius = 300; // تم تقليله من 650
    const arcAngle = 120; // زاوية القوس - تم الاحتفاظ بها
    const itemRotationOffset = 0; // تم تعديله إلى 0 لجعل الدوران طبيعيًا أكثر مع المحور
    const maxRotationSensitivity = 40;
    let currentItemIndex = 0; // العنصر النشط حاليا

    function setupCarouselItems() {
        const angleStep = arcAngle / (numItems - 1);
        const startAngle = -arcAngle / 2;

        carouselItems.forEach((item, i) => {
            const currentAngle = startAngle + (i * angleStep);
            const radAngle = currentAngle * (Math.PI / 180); // تحويل الدرجات إلى راديان يدوياً

            gsap.set(item, {
                x: Math.sin(radAngle) * radius,
                y: Math.cos(radAngle) * radius - radius, // هذا يجعل العناصر في قوس
                z: Math.cos(radAngle) * -radius, // يجعل العناصر الأقرب إلى المنتصف أبعد
                rotationY: currentAngle + itemRotationOffset,
                // تعديل بسيط على الشفافية والحجم لتبدو العناصر في الخلفية أقل وضوحًا
                scale: 1 - (Math.abs(currentAngle) / (arcAngle / 2)) * 0.4, // زيادة تأثير التكبير/التصغير
                opacity: 1 - (Math.abs(currentAngle) / (arcAngle / 2)) * 0.5, // زيادة تأثير الشفافية
                transformOrigin: "center center",
                pointerEvents: "auto",
                zIndex: Math.round(100 - Math.abs(currentAngle))
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

        // حساب الزاوية المستهدفة لتدوير الكاروسيل
        const targetAngle = -((arcAngle / (numItems - 1)) * currentItemIndex - (arcAngle / 2));
        const rotationAmount = targetAngle; // تم تبسيط هذا
        
        gsap.to(carouselWrapper, {
            rotationY: rotationAmount,
            duration: 1, // تم زيادة المدة لجعل الانتقال أبطأ وأكثر سلاسة
            ease: "power3.out",
            onUpdate: () => {
                carouselItems.forEach((item, i) => {
                    const currentRotationY = parseFloat(gsap.get(carouselWrapper, 'rotationY'));
                    const itemAngle = (arcAngle / (numItems - 1)) * i + (-arcAngle / 2) - currentRotationY; // استخدمنا -currentRotationY لتعويض دوران الـ wrapper

                    gsap.to(item, {
                        scale: 1 - (Math.abs(itemAngle) / (arcAngle / 2)) * 0.4,
                        opacity: 1 - (Math.abs(itemAngle) / (arcAngle / 2)) * 0.5,
                        duration: 0.3
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
        // العودة إلى العنصر الحالي عند مغادرة الماوس
        goToItem(currentItemIndex);
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

    // تأثيرات إضافية (إذا كانت تسبب مشاكل، يمكن إزالتها مؤقتًا)
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
