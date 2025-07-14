document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------
    // 1. Skeleton Loader & Main Content Display
    // ---------------------------------------------------
    const skeletonLoader = document.getElementById('skeleton-loader');
    const mainContent = document.getElementById('main-content');

    // Simulate content loading for 2 seconds
    setTimeout(() => {
        skeletonLoader.classList.add('hidden');
        skeletonLoader.addEventListener('transitionend', () => {
            skeletonLoader.remove(); // Remove from DOM after transition
            mainContent.style.display = 'block'; // Show main content
            // Force reflow to ensure display is applied before opacity transition
            mainContent.offsetHeight; 
            mainContent.style.opacity = '1'; // Fade in main content if desired via CSS
        }, { once: true });
    }, 2000); // 2 seconds delay

    // Initial opacity for main content (can be handled by CSS if preferred)
    mainContent.style.opacity = '0';


    // ---------------------------------------------------
    // 2. Three.js Atomic Background
    // ---------------------------------------------------
    const threejsBackgroundContainer = document.getElementById('threejs-background');
    if (threejsBackgroundContainer && typeof THREE !== 'undefined') {
        let scene, camera, renderer, particles, lines;
        let particleCount = 200; // Number of particles
        let particleMaterial; // Declare material outside to change color

        function initThreeJS() {
            // Scene
            scene = new THREE.Scene();

            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            threejsBackgroundContainer.appendChild(renderer.domElement);

            // Particles
            const particleGeometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];
            const sizes = []; // For different particle sizes

            const color1 = new THREE.Color(0x00A6ED); // Accent Blue
            const color2 = new THREE.Color(0x8A2BE2); // Accent Purple

            for (let i = 0; i < particleCount; i++) {
                // Random position within a cube
                positions.push(
                    (Math.random() - 0.5) * 10, // x
                    (Math.random() - 0.5) * 10, // y
                    (Math.random() - 0.5) * 10  // z
                );
                // Gradient color for each particle
                const lerpFactor = Math.random(); // Random factor for color interpolation
                const mixedColor = new THREE.Color().lerpColors(color1, color2, lerpFactor);
                colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
                sizes.push(Math.random() * 0.1 + 0.05); // Random size between 0.05 and 0.15
            }

            particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            particleMaterial = new THREE.PointsMaterial({
                size: 0.1, // Base size
                vertexColors: true, // Use vertex colors
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending, // For glowing effect
                sizeAttenuation: true // Particles closer to camera appear larger
            });

            particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);

            // Lines (connections)
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x8A2BE2, // Initial purple (will be updated dynamically)
                transparent: true,
                opacity: 0.2
            });

            const lineSegments = new Float32Array(particleCount * 3 * 2); // (count * 2 points * 3 coords)

            lines = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
            scene.add(lines);

            // Dynamically update line colors based on accent-primary
            function updateLineColor() {
                const computedStyle = getComputedStyle(document.documentElement);
                const accentPrimary = computedStyle.getPropertyValue('--accent-primary').trim();
                lineMaterial.color.set(accentPrimary);
            }
            // Initial call
            updateLineColor();
            // Listen for custom event to update color when theme changes
            document.addEventListener('themeChange', updateLineColor);

            // Animation loop
            animateThreeJS();
        }

        function animateThreeJS() {
            requestAnimationFrame(animateThreeJS);

            // Particle movement (simple rotation for atomic feel)
            if (particles) {
                particles.rotation.x += 0.0005;
                particles.rotation.y += 0.0007;
            }

            // Update lines
            if (lines) {
                const positions = particles.geometry.attributes.position.array;
                const lineSegments = [];
                const maxDistance = 2; // Connect particles within this distance

                for (let i = 0; i < particleCount; i++) {
                    const p1x = positions[i * 3];
                    const p1y = positions[i * 3 + 1];
                    const p1z = positions[i * 3 + 2];

                    for (let j = i + 1; j < particleCount; j++) {
                        const p2x = positions[j * 3];
                        const p2y = positions[j * 3 + 1];
                        const p2z = positions[j * 3 + 2];

                        const distance = Math.sqrt(
                            (p2x - p1x) ** 2 +
                            (p2y - p1y) ** 2 +
                            (p2z - p1z) ** 2
                        );

                        if (distance < maxDistance) {
                            lineSegments.push(p1x, p1y, p1z, p2x, p2y, p2z);
                        }
                    }
                }
                lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(lineSegments, 3));
                lines.geometry.attributes.position.needsUpdate = true;
            }

            renderer.render(scene, camera);
        }

        // Handle window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize);

        // Initialize Three.js when the script loads
        initThreeJS();
    } else {
        console.warn("Three.js not loaded or container not found. Atomic background will not render.");
    }


    // ---------------------------------------------------
    // 3. Day/Night Theme (Dynamic CSS Variable)
    // ---------------------------------------------------
    function updateThemeColors() {
        const hour = new Date().getHours();
        const root = document.documentElement;
        const isNight = hour > 18 || hour < 6;

        const accentPrimary = isNight ? '#8A2BE2' : '#00A6ED'; // Purple for night, Blue for day
        const accentPrimaryRgb = isNight ? '138, 43, 226' : '0, 166, 237';

        root.style.setProperty('--accent-primary', accentPrimary);
        root.style.setProperty('--accent-primary-rgb', accentPrimaryRgb);

        // Dispatch a custom event to notify other parts of the app (like Three.js lines)
        document.dispatchEvent(new CustomEvent('themeChange'));
    }

    // Call on load and every hour (or more frequently if needed)
    updateThemeColors();
    setInterval(updateThemeColors, 3600000); // Update every hour (3600000 ms)


    // ---------------------------------------------------
    // 4. "Listen to Bio" (Text-to-Speech)
    // ---------------------------------------------------
    const playBioBtn = document.getElementById('play-bio');
    const bioTextElement = document.getElementById('bio-text');

    if (playBioBtn && bioTextElement) {
        let isSpeaking = false;
        let utterance = null;
        let currentVoice = null;

        // Function to find an English male voice
        function findEnglishMaleVoice() {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a male English voice
            for (const voice of voices) {
                // Heuristic for male voice, might not be perfect
                if (voice.lang.startsWith('en') && (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Google US English Male'))) {
                    return voice;
                }
            }
            // Fallback to any English voice if specific male voice not found
            for (const voice of voices) {
                if (voice.lang.startsWith('en')) {
                    return voice;
                }
            }
            return null; // No English voice found
        }

        // Voices are loaded asynchronously, so wait for them
        window.speechSynthesis.onvoiceschanged = () => {
            currentVoice = findEnglishMaleVoice();
        };

        // Ensure voices are loaded if the event already fired
        if (window.speechSynthesis.getVoices().length > 0) {
            currentVoice = findEnglishMaleVoice();
        }

        playBioBtn.addEventListener('click', () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                playBioBtn.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
            } else {
                const textToSpeak = bioTextElement.textContent || "مرحباً بك في عالمي الرقمي! أنا أتوميك، مصمم تجارب تفاعلية.";
                utterance = new SpeechSynthesisUtterance(textToSpeak);

                if (currentVoice) {
                    utterance.voice = currentVoice;
                } else {
                    // Fallback to default if no specific voice found
                    utterance.lang = 'en-US'; // Default to US English
                    console.warn("No specific English male voice found, using default English voice.");
                }

                utterance.rate = 1; // Speed of speech
                utterance.pitch = 1; // Pitch of speech

                utterance.onstart = () => {
                    isSpeaking = true;
                    playBioBtn.innerHTML = 'إيقاف الاستماع <i class="fas fa-volume-mute"></i>';
                };

                utterance.onend = () => {
                    isSpeaking = false;
                    playBioBtn.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                };

                utterance.onerror = (event) => {
                    console.error('SpeechSynthesisUtterance.onerror', event);
                    isSpeaking = false;
                    playBioBtn.innerHTML = 'استمع إلى السيرة الذاتية <i class="fas fa-volume-up"></i>';
                    alert("عذراً، حدث خطأ في تشغيل الصوت. يرجى المحاولة مرة أخرى.");
                };

                window.speechSynthesis.speak(utterance);
            }
        });
    }


    // ---------------------------------------------------
    // 5. Scroll-based Header & Back-to-Top Button
    // ---------------------------------------------------
    const mainHeader = document.querySelector('.main-header');
    const backToTopBtn = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', () => {
        // Header shrink/expand
        if (mainHeader) {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (window.scrollY > 300) { // Show after scrolling 300px
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ---------------------------------------------------
    // 6. Navigation Highlighting with IntersectionObserver
    // ---------------------------------------------------
    // This is prepared for future navigation links if added.
    // Assuming sections have IDs like 'about', 'contact', etc.
    // And nav links have hrefs like '#about', '#contact'.
    const sections = document.querySelectorAll('section'); // Adjust selector as needed

    const navigationAI = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find corresponding nav link and add 'active' class
                const currentSectionId = entry.target.id;
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                    if (link.hash === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.6 }); // Trigger when 60% of the section is visible

    sections.forEach(section => {
        // Only observe sections that actually have an ID and might be targeted by a nav link
        if (section.id) {
            navigationAI.observe(section);
        }
    });


    // ---------------------------------------------------
    // 7. Update Current Year in Footer
    // ---------------------------------------------------
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
