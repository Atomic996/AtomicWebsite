document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(Draggable, MotionPathPlugin); // تسجيل الإضافات

    const slider = document.querySelector('.image-slider');
    const sliderItems = gsap.utils.toArray('.slider-item'); // تحويل العناصر إلى مصفوفة قابلة للاستخدام

    const numItems = sliderItems.length;
    const itemWidth = sliderItems[0].offsetWidth + (parseInt(getComputedStyle(sliderItems[0]).marginRight) || 0) + (parseInt(getComputedStyle(sliderItems[0]).marginLeft) || 0);
    const totalSliderWidth = itemWidth * numItems; // العرض الكلي لكل العناصر

    // وظيفة لتطبيق تحويلات المنظور على العناصر
    function updatePerspective(xPosition) {
        const centerOffset = slider.offsetWidth / 2; // مركز السلايدر الفعلي
        
        sliderItems.forEach((item, index) => {
            const itemCenter = item.offsetLeft + item.offsetWidth / 2;
            // حساب المسافة من مركز السلايدر (المتعلق بموضع السحب)
            const distanceFromCenter = (itemCenter + xPosition) - centerOffset;
            
            // نطاق القيم للتحويلات
            const maxDistance = totalSliderWidth / 2; // أقصى مسافة ممكنة من المركز

            // حساب نسبة المسافة من المركز (-1 إلى 1)
            let normalizedDistance = distanceFromCenter / maxDistance;
            
            // لضمان قيم ضمن -1 و 1
            normalizedDistance = Math.max(-1, Math.min(1, normalizedDistance));

            // تطبيق التدوير: كلما ابتعد عن المركز، زاد التدوير
            const rotationY = normalizedDistance * 45; // تدور 45 درجة كحد أقصى
            
            // تطبيق التكبير: أكبر في المنتصف، أصغر في الأطراف
            const scale = 1 - (Math.abs(normalizedDistance) * 0.4); // يتقلص بنسبة 40% كحد أقصى
            
            // تطبيق الشفافية: أوضح في المنتصف، أقل وضوحًا في الأطراف
            const opacity = 1 - (Math.abs(normalizedDistance) * 0.6); // شفافية بنسبة 60% كحد أقصى

            // تطبيق الـ transform والـ opacity باستخدام GSAP
            gsap.to(item, {
                duration: 0.2, // مدة الانتقال السريع
                rotationY: rotationY,
                scale: scale,
                opacity: opacity,
                ease: "power2.out",
                // Z-index لترتيب العناصر حسب القرب
                zIndex: Math.round((1 - Math.abs(normalizedDistance)) * 100) // الأقرب للمنتصف له z-index أعلى
            });
        });
    }

    // تهيئة حالة السلايدر الأولية
    gsap.set(sliderItems, {
        x: (index) => index * itemWidth // وضع العناصر جنبًا إلى جنب
    });

    // إنشاء Draggable للسلايدر
    Draggable.create(slider, {
        type: "x",
        bounds: { minX: -totalSliderWidth + slider.offsetWidth, maxX: 0 }, // حدود السحب
        liveSnap: { // لجعل العناصر "تستقر" على موضع معين (اخياري)
            x: (value) => {
                const snapPoint = Math.round(value / itemWidth) * itemWidth;
                updatePerspective(snapPoint); // تحديث المنظور عند كل استقرار
                return snapPoint;
            }
        },
        onDrag: function() {
            updatePerspective(this.x); // تحديث المنظور أثناء السحب
        },
        onThrowUpdate: function() {
            updatePerspective(this.x); // تحديث المنظور أثناء حركة الرمي
        },
        onDragEnd: function() {
            // بعد انتهاء السحب، ابحث عن العنصر الأقرب للمنتصف وقم بتوسيطه
            const currentX = this.x;
            let closestItemIndex = 0;
            let minDistance = Infinity;

            sliderItems.forEach((item, index) => {
                const itemPosition = item.offsetLeft + currentX;
                const distance = Math.abs(itemPosition - (slider.offsetWidth / 2 - item.offsetWidth / 2));
                if (distance < minDistance) {
                    minDistance = distance;
                    closestItemIndex = index;
                }
            });

            // تحريك السلايدر لتوسيط العنصر المحدد
            const targetX = (slider.offsetWidth / 2) - (sliderItems[closestItemIndex].offsetLeft + (itemWidth / 2));
            gsap.to(slider, {
                x: targetX,
                duration: 0.5,
                ease: "power3.out",
                onUpdate: () => updatePerspective(gsap.getProperty(slider, "x"))
            });
        }
    });

    // تهيئة المنظور الأولي عند التحميل
    updatePerspective(gsap.getProperty(slider, "x"));
});
