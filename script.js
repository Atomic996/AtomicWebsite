/* الألوان المستوحاة من Atomic */
:root {
    --atomic-black: #1A1A1A; /* خلفية داكنة */
    --atomic-electric-blue: #00BFFF; /* أزرق مشع للعناصر التفاعلية */
    --atomic-silver: #E0E0E0; /* رمادي فاتح للنصوص الثانوية */
    --atomic-gold: #FFD700; /* ذهبي للعناوين والتمييز */
}

/* أساسيات الجسم والخطوط */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--atomic-black);
    color: var(--atomic-silver);
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh; /* تأكد من أن الجسم يملأ الشاشة بالكامل */
    overflow-x: hidden; /* منع التمرير الأفقي غير المرغوب فيه */
}

/* العنوان الرئيسي */
.main-header {
    text-align: center;
    padding: 20px;
    margin-bottom: 40px;
}

.main-header h1 {
    font-size: 4em; /* حجم كبير للعنوان */
    color: var(--atomic-gold); /* لون ذهبي لامع */
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); /* توهج خفيف */
    letter-spacing: 5px; /* تباعد بين الحروف */
    margin: 0;
}

/* حاوية السلايدر */
.slider-container {
    width: 90%;
    max-width: 1200px;
    overflow: hidden; /* يخفي العناصر خارج الحدود للحركة */
    position: relative;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(0, 191, 255, 0.3); /* توهج أزرق خفيف */
    padding: 20px 0;
    background-color: rgba(0, 0, 0, 0.5); /* خلفية شبه شفافة للحاوية */
}

/* شريط الصور المتحرك */
.image-slider {
    display: flex;
    width: fit-content; /* يسمح للعناصر بالتمدد أفقياً */
    /* سيتم التحكم في التحويل بواسطة GSAP */
}

/* عناصر السلايدر (الأيقونات) */
.slider-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none; /* إزالة خط تحت الرابط */
    color: var(--atomic-silver);
    min-width: 180px; /* عرض أدنى لكل عنصر */
    margin: 0 15px; /* تباعد بين العناصر */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 15px;
    border-radius: 10px;
    background-color: rgba(0, 191, 255, 0.05); /* خلفية زرقاء شفافة خفيفة */
    border: 1px solid rgba(0, 191, 255, 0.1);
}

.slider-item img {
    width: 100px; /* حجم الأيقونة */
    height: 100px;
    border-radius: 50%; /* لجعلها دائرية إذا كانت الصور مربعة */
    object-fit: cover;
    border: 3px solid var(--atomic-electric-blue); /* إطار أزرق حول الصورة */
    box-shadow: 0 0 15px rgba(0, 191, 255, 0.6); /* توهج حول الصورة */
    transition: transform 0.3s ease;
}

.slider-item p {
    margin-top: 10px;
    font-size: 1.1em;
    font-weight: bold;
    color: var(--atomic-electric-blue); /* لون أزرق لأسماء المنصات */
    text-shadow: 0 0 5px rgba(0, 191, 255, 0.4);
}

/* تأثير التحويم (Hover Effect) */
.slider-item:hover {
    transform: translateY(-10px) scale(1.05); /* رفع وتكبير العنصر قليلاً */
    box-shadow: 0 0 40px rgba(0, 191, 255, 0.8); /* توهج أكبر عند التحويم */
    background-color: rgba(0, 191, 255, 0.15);
}

.slider-item:hover img {
    transform: scale(1.1); /* تكبير الصورة داخل العنصر */
    box-shadow: 0 0 25px rgba(0, 191, 255, 1); /* توهج أقوى للصورة */
}

/* استجابة التصميم للشاشات الصغيرة */
@media (max-width: 768px) {
    .main-header h1 {
        font-size: 3em;
    }
    .slider-item {
        min-width: 140px;
        margin: 0 10px;
    }
    .slider-item img {
        width: 80px;
        height: 80px;
    }
    .slider-item p {
        font-size: 1em;
    }
}

@media (max-width: 480px) {
    .main-header h1 {
        font-size: 2.5em;
    }
    .slider-item {
        min-width: 120px;
        margin: 0 8px;
    }
    .slider-item img {
        width: 70px;
        height: 70px;
    }
    .slider-item p {
        font-size: 0.9em;
    }
}
