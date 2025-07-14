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
    const radius = 650; // يمكن تعديل هذا الرقم لتغيير عمق الكاروسيل
    const arcAngle = 100; // يمكن تعديل هذا الرقم لتغيير زاوية الكاروسيل
    const itemRotationOffset = 10;
    const maxRotationSensitivity = 40; // حساسية دوران الكاروسيل بالماوس
    let currentItemIndex = 0; // العنصر النشط حالياً

    // تهيئة مواقع العناصر
    function setupCarouselItems() {
        const angleStep = arcAngle / (numItems - 1);
        const startAngle = -arcAngle / 2;

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
        });
        createCarouselDots(); // إنشاء النقاط عند تهيئة الكاروسيل
        updateDots(); // تحديث النقاط بعد التهيئة
    }

    // تحديث دوران الكاروسيل بناءً على حركة الماوس/اللمس
    function updateCarouselRotation(normalizedX) {
        gsap.to(carouselWrapper, {
            rotationY: normalizedX * maxRotationSensitivity,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // الانتقال إلى عنصر محدد في الكاروسيل
    function goToItem(index) {
        let targetIndex = index;
        if (targetIndex < 0) {
            targetIndex = numItems - 1;
        } else if (targetIndex >= numItems) {
            targetIndex = 0;
        }
        currentItemIndex = targetIndex;

        const angleStep = arcAngle / (numItems - 1);
        const targetAngle = (-arcAngle / 2) + (currentItemIndex * angleStep);

        gsap.to(carouselWrapper, {
            rotationY: -targetAngle, // يدور الغلاف ليكون العنصر المستهدف في المنتصف
            duration: 0.8,
            ease: "power3.out"
        });

        updateDots(); // تحديث حالة النقاط
        updateItemVisibility(); // تحديث رؤية العناصر بناءً على العنصر النشط
    }

    // تحديث رؤية العناصر (مثل زيادة التعتيم للعنصر النشط)
    function updateItemVisibility() {
        carouselItems.forEach((item, i) => {
            const distance = Math.abs(i - currentItemIndex);
            const opacity = 1 - (distance * 0.3); // تقليل التعتيم للعناصر البعيدة
            const scale = 1 - (distance * 0.1); // تقليل الحجم للعناصر البعيدة

            gsap.to(item, {
                opacity: opacity,
                scale: scale,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    }

    // إنشاء نقاط التنقل
    function createCarouselDots() {
        carouselDotsContainer.innerHTML = ''; // مسح أي نقاط موجودة
        for (let i = 0; i < numItems; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === currentItemIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => goToItem(i));
            carouselDotsContainer.appendChild(dot);
        }
    }

    // تحديث حالة النقاط
    function updateDots() {
        document.querySelectorAll('.carousel-dots .dot').forEach((dot, i) => {
            if (i === currentItemIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // تهيئة الكاروسيل عند التحميل
    setupCarouselItems();
    goToItem(0); // ابدأ بالعنصر الأول

    // أحداث الماوس للتحكم في الكاروسيل
    carouselContainer.addEventListener('mousemove', (e) => {
        const rect = carouselContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const normalizedX = (mouseX / rect.width) * 2 - 1; // تحويل إلى نطاق -1 إلى 1
        updateCarouselRotation(normalizedX);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        // إعادة الكاروسيل إلى وضعه الأصلي بعد مغادرة الماوس
        gsap.to(carouselWrapper, {
            rotationY: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.7)"
        });
    });

    // أحداث اللمس للتحكم في الكاروسيل
    carouselContainer.addEventListener('touchmove', (e) => {
        e.preventDefault(); // منع التمرير الافتراضي
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

    // أحداث النقر على أزرار التنقل
    prevBtn.addEventListener('click', () => goToItem(currentItemIndex - 1));
    nextBtn.addEventListener('click', () => goToItem(currentItemIndex + 1));

    // تحديث سنة حقوق الطبع والنشر في الفوتر
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // وظيفة زر العودة للأعلى
    const backToTopBtn = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // أظهر الزر بعد التمرير 300 بكسل
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // للتمرير الناعم
        });
    });

    // تأثيرات الرسوم المتحركة الأولية
    gsap.from('.carousel-item', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        delay: 0.5 // تأخير لبدء الرسوم المتحركة بعد تحميل الصفحة
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
