document.addEventListener('DOMContentLoaded', () => {
    // تهيئة الكاروسيل ثلاثي الأبعاد
    const init3DCarousel = () => {
        const carousel = document.querySelector('.carousel-wrapper');
        const items = document.querySelectorAll('.carousel-item');
        const angle = 360 / items.length;

        items.forEach((item, i) => {
            const rotateY = angle * i;
            item.style.transform = `rotateY(${rotateY}deg) translateZ(300px)`;
        });

        // التحكم بالتدوير
        let currentAngle = 0;
        document.addEventListener('mousemove', (e) => {
            const sensitivity = 0.2;
            currentAngle = e.clientX * sensitivity;
            carousel.style.transform = `translateZ(-300px) rotateY(${-currentAngle}deg)`;
        });
    };

    // تحديث سنة الحقوق
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // تهيئة المشروع
    init3DCarousel();
});
