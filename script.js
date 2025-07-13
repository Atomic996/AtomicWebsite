document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.image-slider');
    const sliderItems = document.querySelectorAll('.slider-item');

    // Duplicate slider items to create a seamless loop effect
    // This is crucial for the continuous scroll.
    const numberOfOriginalItems = sliderItems.length;
    for (let i = 0; i < numberOfOriginalItems; i++) {
        const clone = sliderItems[i].cloneNode(true);
        slider.appendChild(clone);
    }

    // Recalculate slider items after cloning
    const allSliderItems = document.querySelectorAll('.slider-item');
    
    let totalWidth = 0;
    allSliderItems.forEach(item => {
        totalWidth += item.offsetWidth + (parseInt(getComputedStyle(item).marginLeft) || 0) + (parseInt(getComputedStyle(item).marginRight) || 0);
    });

    // We only want to scroll the width of the original items once to create the seamless loop
    // GSAP's modifiers will handle the continuous loop using the total width.
    const scrollDistance = totalWidth / 2; // Scroll only the original set of items

    // GSAP animation for continuous horizontal scroll
    gsap.to(slider, {
        x: -scrollDistance, // Scroll to the left by the calculated distance
        ease: "none", // Linear movement
        duration: 30, // Adjust duration for scroll speed (increased for smoother, slower loop)
        repeat: -1, // Loop infinitely
        modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % scrollDistance) // Ensures seamless looping
        }
    });

    // Optional: Pause animation on hover
    slider.addEventListener('mouseenter', () => {
        gsap.to(gsap.globalTimeline, { timeScale: 0.2 }); // Slow down animation
    });

    slider.addEventListener('mouseleave', () => {
        gsap.to(gsap.globalTimeline, { timeScale: 1 }); // Resume normal speed
    });
});
