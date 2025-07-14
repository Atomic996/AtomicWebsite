document.addEventListener('DOMContentLoaded', () => {
    // تسجيل إضافات GSAP
    gsap.registerPlugin(MotionPathPlugin);

    // عناصر الكاروسيل
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselItems = gsap.utils.toArray('.carousel-item');

    // إعدادات الكاروسيل
    const numItems = carouselItems.length;
    const radius = 650;
    const arcAngle = 100;
    const itemRotationOffset = 10;
    const maxRotationSensitivity = 40;

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
    }

    // تحديث دوران الكاروسيل
    function updateCarouselRotation(normalizedX) {
        gsap.to(carouselWrapper, {
            rotationY: normalizedX * maxRotationSensitivity,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // تهيئة الكاروسيل
    setupCarouselItems();

    // أحداث الماوس
    carouselContainer.addEventListener('mousemove', (e) => {
        const rect = carouselContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const normalizedX = (mouseX / rect.width) * 2 - 1;
        updateCarouselRotation(normalizedX);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        gsap.to(carouselWrapper, {
            rotationY: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.7)"
        });
    });

    // أحداث اللمس
    carouselContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
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
