document.addEventListener('DOMContentLoaded', () => {
    // --- TAB 1 (TIME CALCULATOR) LOGIC ---
    const timeEntriesContainer = document.getElementById('time-entries');
    const addTimeBtn = document.getElementById('add-time-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('section-3-results');
    const resultHM = document.getElementById('result-hm');
    const resultDecimal = document.getElementById('result-decimal');
    const errorMessage = document.getElementById('error-message');

    // Only run if elements exist on page
    if (!timeEntriesContainer) return;

    const calculateTime = () => {
        const entries = document.querySelectorAll('.time-entry');
        let totalMinutes = 0;
        let validEntriesCount = 0;
        let hasIncomplete = false;

        entries.forEach(entry => {
            const startInput = entry.querySelector('.start-time').value;
            const endInput = entry.querySelector('.end-time').value;
            const durationEl = entry.querySelector('.row-duration');
            
            if (durationEl) durationEl.textContent = ''; // clear initial

            if (!startInput && !endInput) return; // Ignore completely empty rows

            if (!startInput || !endInput) {
                hasIncomplete = true;
                return;
            }

            const startMin = timeToMinutes(startInput);
            let endMin = timeToMinutes(endInput);

            if (endMin < startMin) {
                endMin += 24 * 60;
            }

            const diff = endMin - startMin;
            totalMinutes += diff;
            validEntriesCount++;
            
            if (durationEl) {
                const rowDecimal = (diff / 60).toFixed(2);
                durationEl.textContent = rowDecimal;
                // show copy button when there's a value
                const copyWrapper = entry.querySelector('.tab1-copy-wrapper');
                if (copyWrapper) {
                    copyWrapper.classList.remove('hidden');
                    copyWrapper.classList.add('flex');
                }
            }
        });

        // Hide if no valid entries or if user is midway typing a pair
        if (validEntriesCount === 0 || hasIncomplete) {
            resultsSection.classList.remove('opacity-100');
            setTimeout(() => resultsSection.classList.add('hidden'), 300);
            return;
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const decimalHours = (totalMinutes / 60).toFixed(2);

        resultHM.textContent = `${hours} ชม. ${minutes} นาที`;
        resultDecimal.textContent = `${decimalHours}`;

        resultsSection.classList.remove('hidden');
        setTimeout(() => {
            resultsSection.classList.add('opacity-100');
        }, 10);
    };

    const getRowHTML = () => `
        <div class="flex items-center gap-3">
            <div class="flex-1">
                <label class="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">เวลาเริ่มต้น</label>
                <input type="text" inputmode="numeric" placeholder="00:00" class="start-time w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 font-mono text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner" required>
            </div>
            <div class="flex-1">
                <label class="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">เวลาสิ้นสุด</label>
                <input type="text" inputmode="numeric" placeholder="00:00" class="end-time w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 font-mono text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner" required>
            </div>
        </div>
        <div class="flex items-center justify-end gap-2">
            <span class="text-xl font-bold text-indigo-400 font-mono tabular-nums row-duration"></span>
            <div class="tab1-copy-wrapper hidden items-center gap-2 shrink-0">
                <div class="w-px h-6 bg-zinc-800"></div>
                <button type="button" class="tab1-copy-row-btn w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-950/40 hover:bg-indigo-600 border border-zinc-800 rounded-lg transition-all active:scale-95 shadow-inner relative" title="คัดลอกค่า">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>
                </button>
            </div>
        </div>
        <button type="button" class="remove-btn absolute -right-2 -top-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
        </button>
    `;

    addTimeBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.className = 'time-entry group flex flex-col gap-2 bg-zinc-900 p-4 rounded-xl border border-zinc-800 relative hover:border-zinc-700 mt-3 transition-all duration-300';
        newRow.innerHTML = getRowHTML();

        const removeBtn = newRow.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                newRow.remove();
                calculateTime(); // auto-recalculate on remove
            });
        }

        timeEntriesContainer.appendChild(newRow);
        timeEntriesContainer.scrollTop = timeEntriesContainer.scrollHeight;
    });

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return null;
        
        if (timeStr.includes(':')) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return (hours * 60) + minutes;
        }

        const cleanStr = timeStr.replace(/\D/g, '');
        if (cleanStr.length <= 2) {
            return parseInt(cleanStr || '0', 10) * 60;
        } else {
            const hours = parseInt(cleanStr.slice(0, -2), 10);
            const minutes = parseInt(cleanStr.slice(-2), 10);
            return (hours * 60) + minutes;
        }
    };

    calculateBtn.addEventListener('click', calculateTime);

    timeEntriesContainer.addEventListener('input', (e) => {
        calculateTime(); // auto-recalculate on input change

        // Auto-focus logic simplified for text input
        if (e.target.classList.contains('start-time')) {
            let val = e.target.value;
            // If they type 4 digits (e.g. 0830) or 5 chars (08:30), auto jump
            if (val.length === 4 && !val.includes(':') || val.length >= 5) {
                const row = e.target.closest('.time-entry');
                if (row) {
                    const endInput = row.querySelector('.end-time');
                    if (endInput) endInput.focus();
                }
            }
        }
    });

    // Auto-format the time nicely when user leaves the input field
    timeEntriesContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('start-time') || e.target.classList.contains('end-time')) {
            let val = e.target.value.trim();
            if (!val) return;
            
            if (val.includes(':')) {
                let [h, m] = val.split(':');
                h = h.padStart(2, '0');
                m = m ? m.padStart(2, '0') : '00';
                e.target.value = `${h}:${m}`;
            } else {
                const cleanStr = val.replace(/\D/g, '');
                if (cleanStr.length > 0) {
                    if (cleanStr.length <= 2) {
                        e.target.value = `${cleanStr.padStart(2, '0')}:00`;
                    } else {
                        let h = cleanStr.slice(0, -2).padStart(2, '0');
                        let m = cleanStr.slice(-2);
                        e.target.value = `${h}:${m}`;
                    }
                }
            }
            calculateTime(); // update calculation with formatted value
        }
    });

    // ── Tooltip helper ────────────────────────────────────────────────────────
    const showTooltip = (targetEl, msg) => {
        const existing = targetEl.querySelector('.copy-tooltip');
        if (existing) existing.remove();

        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded shadow-lg font-sans font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 translate-y-1 transition-all duration-200';
        tooltip.textContent = msg;

        targetEl.classList.add('relative');
        targetEl.appendChild(tooltip);

        requestAnimationFrame(() => {
            tooltip.classList.remove('opacity-0', 'translate-y-1');
            tooltip.classList.add('opacity-100', 'translate-y-0');
        });

        setTimeout(() => {
            tooltip.classList.remove('opacity-100', 'translate-y-0');
            tooltip.classList.add('opacity-0', 'translate-y-1');
            setTimeout(() => tooltip.remove(), 200);
        }, 1000);
    };

    // ── Row copy button handler ──────────────────────────────────────────────
    timeEntriesContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.tab1-copy-row-btn');
        if (!copyBtn) return;

        const row = copyBtn.closest('.time-entry');
        if (!row) return;

        const durationEl = row.querySelector('.row-duration');
        const val = durationEl ? durationEl.textContent.trim() : '';
        if (!val) return;

        navigator.clipboard.writeText(val).then(() => {
            showTooltip(copyBtn, 'คัดลอกแล้ว!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });

    // Clear Button Logic
    const clearBtn = document.getElementById('clear-tab1-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const entries = document.querySelectorAll('#tab-1 .time-entry');
            entries.forEach((entry, index) => {
                if (index === 0) {
                    entry.querySelector('.start-time').value = '';
                    entry.querySelector('.end-time').value = '';
                    const durationEl = entry.querySelector('.row-duration');
                    if (durationEl) durationEl.textContent = '';
                    // hide copy button
                    const copyWrapper = entry.querySelector('.tab1-copy-wrapper');
                    if (copyWrapper) {
                        copyWrapper.classList.add('hidden');
                        copyWrapper.classList.remove('flex');
                    }
                } else {
                    entry.remove();
                }
            });
            calculateTime();
        });
    }
});
