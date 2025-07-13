// نظام التحكم الصوتي
const VoiceControl = (() => {
    const init = () => {
        const voiceBtn = document.getElementById('voiceControlBtn');
        
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'ar-SA';
            
            voiceBtn.addEventListener('click', () => {
                recognition.start();
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> جاري الاستماع...';
                
                recognition.onresult = (event) => {
                    const command = event.results[0][0].transcript;
                    handleVoiceCommand(command);
                };
            });
        } else {
            voiceBtn.style.display = 'none';
        }
    };

    const handleVoiceCommand = (command) => {
        console.log('تم التعرف على:', command);
        // معالجة الأوامر الصوتية هنا
    };

    return { init };
})();

// بدء النظام
VoiceControl.init();
