document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(MotionPathPlugin);

    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = gsap.utils.toArray('.carousel-item');

    const numItems = carouselItems.length;
    // هذه القيم يمكن تعديلها لضبط شكل القوس والتفاعل
    const radius = 650; // نصف قطر الدائرة الوهمية التي تتوزع عليها العناصر. قيمة أكبر تجعل القوس أقل انحناءً.
    const arcAngle = 100; // الزاوية الكلية للقوس الذي تشغله العناصر (بالدرجات).
    const itemRotationOffset = 10; // تدوير إضافي لكل عنصر ليواجه المنتصف بشكل أفضل
    const maxRotationSensitivity = 40; // أقصى دوران للكاروسيل ككل بناءً على حركة الماوس

    // دالة لضبط المواقع الأولية للعناصر في شكل قوسي ثلاثي الأبعاد
    function setupCarouselItems() {
        // حساب الزاوية بين كل عنصر وآخر
        const angleStep = arcAngle / (numItems - 1);
        // حساب الزاوية المركزية للقوس (نقطة المنتصف)
        const startAngle = -arcAngle / 2;

        carouselItems.forEach((item, i) => {
            const currentAngle = startAngle + (i * angleStep);
            const radAngle = gsap.utils.degToRad(currentAngle);

            // تحديد موضع X, Y, Z باستخدام الدوال المثلثية لخلق القوس
            gsap.set(item, {
                x: Math.sin(radAngle) * radius,
                y: Math.cos(radAngle) * radius - radius, // يرفع العناصر للأعلى لتبدو وكأنها في قوس
                z: Math.cos(radAngle) * -radius, // يجعل العناصر البعيدة تظهر أصغر وأبعد
                rotationY: currentAngle + itemRotationOffset, // يدور العنصر ليواجه المنتصف أو يميل قليلاً
                scale: 1 - (Math.abs(currentAngle) / (arcAngle / 2)) * 0.3, // يقلل حجم العناصر في الأطراف
                opacity: 1 - (Math.abs(currentAngle) / (arcAngle / 2)) * 0.4, // يقلل شفافية العناصر في الأطراف
                transformOrigin: "center center",
                pointerEvents: "auto", // التأكد من أن العناصر قابلة للنقر
                zIndex: Math.round(100 - Math.abs(currentAngle)) // الأقرب للمنتصف له z-index أعلى
            });
        });
    }

    // تهيئة العناصر عند تحميل الصفحة
    setupCarouselItems();

    // دالة لتحديث تدوير الكاروسيل بالكامل بناءً على موضع الماوس/اللمس
    function updateCarouselRotation(normalizedX) {
        // normalizedX من -1 (أقصى اليسار) إلى 1 (أقصى اليمين)
        const targetRotation = normalizedX * maxRotationSensitivity; // تطبيق أقصى دوران
        
        gsap.to(carouselWrapper, {
            rotationY: targetRotation,
            duration: 0.5, // مدة الانتقال السريع
            ease: "power2.out"
        });
    }

    // Listener for mouse movement (للكمبيوتر)
    carouselContainer.addEventListener('mousemove', (e) => {
        const rect = carouselContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const normalizedX = (mouseX / rect.width) * 2 - 1; // تحويل إلى نطاق -1 إلى 1
        updateCarouselRotation(normalizedX);
    });

    // Listener for touch movement (للهواتف)
    carouselContainer.addEventListener('touchmove', (e) => {
        e.preventDefault(); // منع التمرير الافتراضي للصفحة
        const rect = carouselContainer.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const normalizedX = (touchX / rect.width) * 2 - 1; // تحويل إلى نطاق -1 إلى 1
        updateCarouselRotation(normalizedX);
    });

    // إعادة الكاروسيل إلى وضعه الأصلي عند ترك الماوس/اللمس
    carouselContainer.addEventListener('mouseleave', () => {
        gsap.to(carouselWrapper, {
            rotationY: 0, // العودة إلى الصفر
            duration: 0.8,
            ease: "elastic.out(1, 0.7)" // تأثير ارتداد لطيف
        });
    });

    carouselContainer.addEventListener('touchend', () => {
        gsap.to(carouselWrapper, {
            rotationY: 0, // العودة إلى الصفر
            duration: 0.8,
            ease: "elastic.out(1, 0.7)"
        });
    });

    // لا نحتاج لـ mouseenter/mouseleave على العناصر الفردية هنا، لأن تأثير الـ hover في CSS يكفي
    // وتأثيرات التحجيم والشفافية تتم بواسطة حركة الماوس الرئيسية
});
