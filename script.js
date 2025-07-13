document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(MotionPathPlugin); // تسجيل الإضافات

    const perspectiveContainer = document.querySelector('.perspective-container');
    const slider = document.querySelector('.image-slider');
    const sliderItems = gsap.utils.toArray('.slider-item'); // تحويل العناصر إلى مصفوفة قابلة للاستخدام

    const numItems = sliderItems.length;
    // القيم التالية قابلة للتعديل للحصول على التأثير المرغوب فيه
    const itemVisualWidth = 200; // العرض المرئي للعنصر (يجب أن يتطابق مع CSS)
    const radius = 600; // نصف قطر الدائرة الافتراضية التي تتوزع عليها العناصر
    const maxRotationAngle = 30; // أقصى زاوية دوران للسلايدر ككل بناءً على حركة الماوس
    const itemSpreadAngle = 25; // زاوية التباعد بين العناصر في القوس

    // ضبط المواقع الأولية للعناصر في شكل قوسي
    gsap.set(sliderItems, {
        position: 'absolute',
        // حساب موضع X لكل عنصر في القوس
        x: (i) => {
            const angle = (i - (numItems - 1) / 2) * itemSpreadAngle; // زاوية توزيع العناصر
            return Math.sin(gsap.utils.degToRad(angle)) * radius; // تحديد X بناءً على دائرة
        },
        // حساب موضع Y لكل عنصر في القوس (لرفعها أو خفضها قليلاً)
        y: (i) => {
            const angle = (i - (numItems - 1) / 2) * itemSpreadAngle;
            return Math.cos(gsap.utils.degToRad(angle)) * radius - radius; // تحديد Y لضبط الارتفاع
        },
        // حساب موضع Z لكل عنصر في القوس (لجعلها أبعد في الأطراف وأقرب في المنتصف)
        z: (i) => {
            const angle = (i - (numItems - 1) / 2) * itemSpreadAngle;
            return (1 - Math.cos(gsap.utils.degToRad(angle))) * -radius; // تحديد Z لجعلها أبعد في الأطراف
        },
        // تدوير كل عنصر حول محوره Y ليواجه المنتصف أو يميل قليلاً
        rotationY: (i) => {
            const angle = (i - (numItems - 1) / 2) * 15; // تدوير كل عنصر قليلاً بشكل فردي
            return angle;
        },
        scale: 0.8, // تصغير العناصر قليلا في البداية
        opacity: 0.7, // جعلها شفافة قليلا
        transformOrigin: "center center",
        pointerEvents: "auto" // السماح بالنقر على العناصر
    });

    // دالة لتحديث تدوير السلايدر بالكامل بناءً على موضع الماوس/اللمس
    let currentRotation = 0; // تتبع الدوران الحالي للسلايدر

    function updateSliderRotation(normalizedX) {
        // normalizedX من -1 (أقصى اليسار) إلى 1 (أقصى اليمين)
        currentRotation = normalizedX * maxRotationAngle; // تطبيق أقصى دوران
        
        gsap.to(slider, {
            rotationY: currentRotation,
            duration: 0.5, // مدة الانتقال
            ease: "power2.out"
        });
    }

    // Listener for mouse movement (للكمبيوتر)
    perspectiveContainer.addEventListener('mousemove', (e) => {
        // حساب موضع الماوس بالنسبة للحاوية (من 0 إلى 1)
        const rect = perspectiveContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const normalizedX = (mouseX / rect.width) * 2 - 1; // تحويل إلى نطاق -1 إلى 1
        updateSliderRotation(normalizedX);
    });

    // Listener for touch movement (للهواتف)
    perspectiveContainer.addEventListener('touchmove', (e) => {
        e.preventDefault(); // منع التمرير الافتراضي للصفحة
        const rect = perspectiveContainer.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const normalizedX = (touchX / rect.width) * 2 - 1; // تحويل إلى نطاق -1 إلى 1
        updateSliderRotation(normalizedX);
    });

    // إعادة السلايدر إلى وضعه الأصلي عند ترك الماوس/اللمس
    perspectiveContainer.addEventListener('mouseleave', () => {
        gsap.to(slider, {
            rotationY: 0, // العودة إلى الصفر
            duration: 0.8,
            ease: "elastic.out(1, 0.7)" // تأثير ارتداد لطيف
        });
    });

    perspectiveContainer.addEventListener('touchend', () => {
        gsap.to(slider, {
            rotationY: 0, // العودة إلى الصفر
            duration: 0.8,
            ease: "elastic.out(1, 0.7)"
        });
    });

    // تأثير التحويم على العناصر الفردية (موجود في CSS أيضاً)
    sliderItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.15, // تكبير أكثر
                z: 100, // سحب العنصر للأمام في 3D
                duration: 0.3,
                ease: "power2.out"
            });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 0.8, // العودة للحجم الأصلي
                // يجب أن يعود إلى قيمة z الأصلية المحددة في gsap.set
                z: gsap.getProperty(item, "z"),
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
});
