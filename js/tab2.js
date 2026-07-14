document.addEventListener('DOMContentLoaded', () => {
    // --- TAB 2 (SUM TEXT TIME) LOGIC ---
    const rawTimeText = document.getElementById('raw-time-text');
    const calcTab2Btn = document.getElementById('calc-tab2-btn');
    const tab2Results = document.getElementById('tab2-results');
    const tab2DetectedTimes = document.getElementById('tab2-detected-times');
    const tab2ResultHM = document.getElementById('tab2-result-hm');
    const tab2ResultDecimal = document.getElementById('tab2-result-decimal');

    if (!rawTimeText) return;

    const calculateTab2 = () => {
        const text = rawTimeText.value;
        if (!text.trim()) {
            tab2Results.classList.remove('opacity-100');
            setTimeout(() => tab2Results.classList.add('hidden'), 300);
            return;
        }

        // Regex to find HH:MM or HH:MM:SS (capturing only HH and MM)
        const regex = /(\d{1,2}):(\d{2})(?::\d{1,2})?/g;
        let match;
        let totalMinutes = 0;
        let detectedStrings = [];

        while ((match = regex.exec(text)) !== null) {
            const hours = parseInt(match[1], 10);
            const mins = parseInt(match[2], 10);
            totalMinutes += (hours * 60) + mins;
            detectedStrings.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        }

        if (detectedStrings.length === 0) {
            tab2DetectedTimes.innerHTML = '<span class="text-red-400">ไม่พบรูปแบบเวลาในข้อความ</span>';
            tab2ResultHM.textContent = '0 ชม. 0 นาที';
            tab2ResultDecimal.textContent = '0.00';
        } else {
            tab2DetectedTimes.textContent = detectedStrings.join(' + ');
            
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            const dec = (totalMinutes / 60).toFixed(2);

            tab2ResultHM.textContent = `${h} ชม. ${m} นาที`;
            tab2ResultDecimal.textContent = `${dec}`;
        }

        tab2Results.classList.remove('hidden');
        setTimeout(() => {
            tab2Results.classList.add('opacity-100');
        }, 10);
    };

    calcTab2Btn.addEventListener('click', calculateTab2);
    rawTimeText.addEventListener('input', calculateTab2); // auto-calculate on input

    // Clear Button Logic
    const clearBtn = document.getElementById('clear-tab2-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            rawTimeText.value = '';
            calculateTab2();
        });
    }
});

// Global copy function for tab2 decimal result
function copyTab2Decimal() {
    const value = document.getElementById('tab2-result-decimal').textContent;
    navigator.clipboard.writeText(value).then(() => {
        const icon = document.getElementById('copy-tab2-decimal-icon');
        const check = document.getElementById('copy-tab2-decimal-check');
        icon.classList.add('hidden');
        check.classList.remove('hidden');
        setTimeout(() => {
            check.classList.add('hidden');
            icon.classList.remove('hidden');
        }, 1500);
    });
}
