document.addEventListener('DOMContentLoaded', () => {
    // --- TAB 3 (TIME TO DECIMAL HOURS) LOGIC ---
    const entriesContainer = document.getElementById('tab3-entries');
    const addBtn = document.getElementById('add-tab3-btn');
    const exportFormatSelect = document.getElementById('tab3-export-format');
    const exportTextarea = document.getElementById('tab3-export-text');
    const copyBtn = document.getElementById('tab3-copy-btn');

    if (!entriesContainer) return;

    const createRowHTML = () => `
        <div class="tab3-entry flex flex-col sm:flex-row gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 relative hover:border-zinc-700">
            <button type="button" class="tab3-remove-btn absolute top-3 right-3 text-zinc-500 hover:text-red-400 hidden bg-zinc-950 p-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
            </button>
            <div class="flex-1">
                <label class="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">ช่วงเวลา</label>
                <input type="text" placeholder="15:10 หรือ 53 นาที" class="tab3-time w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner">
            </div>
            <div class="flex-none sm:w-28 flex flex-col justify-center items-end sm:items-center mt-2 sm:mt-0">
                <label class="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 sm:hidden font-semibold">ชั่วโมงทศนิยม</label>
                <span class="tab3-row-result text-2xl font-bold text-indigo-400 font-mono">0.00</span>
            </div>
        </div>
    `;

    const formatTimeInput = (input) => {
        const val = input.value.trim();
        if (!val) return;
        
        if (val.includes('ชม') || val.includes('ชั่วโมง') || val.includes('นาที')) {
            let h = 0;
            let m = 0;
            const hMatch = val.match(/(\d+)\s*(?:ชม|ชั่วโมง)/);
            if (hMatch) h = parseInt(hMatch[1], 10);
            
            const mMatch = val.match(/(\d+)\s*นาที/);
            if (mMatch) m = parseInt(mMatch[1], 10);
            
            input.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            return;
        }

        if (val.includes(':')) {
            let [h, m] = val.split(':');
            h = h.padStart(2, '0');
            m = m ? m.padStart(2, '0') : '00';
            input.value = `${h}:${m}`;
        } else {
            const clean = val.replace(/\D/g, '');
            if (clean.length > 0) {
                if (clean.length <= 2) {
                    input.value = `${clean.padStart(2, '0')}:00`;
                } else {
                    const h = clean.slice(0, -2).padStart(2, '0');
                    const m = clean.slice(-2);
                    input.value = `${h}:${m}`;
                }
            }
        }
    };

    const calculateRow = (row) => {
        const timeInput = row.querySelector('.tab3-time');
        const resultSpan = row.querySelector('.tab3-row-result');
        const val = timeInput.value.trim();
        
        let totalMinutes = null;

        if (val.includes('ชม') || val.includes('ชั่วโมง') || val.includes('นาที')) {
            let h = 0;
            let m = 0;
            const hMatch = val.match(/(\d+)\s*(?:ชม|ชั่วโมง)/);
            if (hMatch) h = parseInt(hMatch[1], 10);
            
            const mMatch = val.match(/(\d+)\s*นาที/);
            if (mMatch) m = parseInt(mMatch[1], 10);
            
            totalMinutes = (h * 60) + m;
        } else if (val.includes(':')) {
            const [h, m] = val.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                totalMinutes = (h * 60) + m;
            }
        } else {
            const clean = val.replace(/\D/g, '');
            if (clean.length > 0) {
                if (clean.length <= 2) {
                    totalMinutes = parseInt(clean, 10) * 60;
                } else {
                    const h = parseInt(clean.slice(0, -2), 10);
                    const m = parseInt(clean.slice(-2), 10);
                    totalMinutes = (h * 60) + m;
                }
            }
        }

        if (totalMinutes !== null) {
            resultSpan.textContent = (totalMinutes / 60).toFixed(2);
        } else {
            resultSpan.textContent = "0.00";
        }
        
        updateExport();
    };

    const updateExport = () => {
        const format = exportFormatSelect.value;
        const rows = document.querySelectorAll('.tab3-entry');
        
        let data = [];
        rows.forEach(row => {
            const result = row.querySelector('.tab3-row-result').textContent;
            const timeInput = row.querySelector('.tab3-time').value.trim();
            // Only add if there is a result or they entered a time
            if (result !== "0.00" || timeInput !== "") {
                data.push(result);
            }
        });

        if (data.length === 0) {
            exportTextarea.value = "";
            return;
        }

        if (format === 'vertical') {
            // Just Decimal (newlines)
            exportTextarea.value = data.join('\n');
        } else {
            // Horizontal: 
            // Just Vals (tabs)
            exportTextarea.value = data.join('\t');
        }
    };

    const updateRemoveButtons = () => {
        const rows = document.querySelectorAll('.tab3-entry');
        rows.forEach((row, index) => {
            const btn = row.querySelector('.tab3-remove-btn');
            if (rows.length === 1) {
                btn.classList.add('hidden');
            } else {
                btn.classList.remove('hidden');
            }
        });
    };

    // Events
    addBtn.addEventListener('click', () => {
        entriesContainer.insertAdjacentHTML('beforeend', createRowHTML());
        updateRemoveButtons();
        updateExport();
        // scroll to bottom
        entriesContainer.scrollTop = entriesContainer.scrollHeight;
    });

    entriesContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.tab3-remove-btn');
        if (removeBtn) {
            const row = removeBtn.closest('.tab3-entry');
            if (document.querySelectorAll('.tab3-entry').length > 1) {
                row.remove();
                updateRemoveButtons();
                updateExport();
            }
        }
    });

    entriesContainer.addEventListener('paste', (e) => {
        const target = e.target;
        if (!target.classList.contains('tab3-time')) return;

        const pasteData = (e.clipboardData || window.clipboardData).getData('text');
        if (!pasteData) return;

        const lines = pasteData.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 1) {
            e.preventDefault(); // Stop normal paste
            
            let rows = Array.from(document.querySelectorAll('.tab3-entry'));
            const currentRowIndex = rows.findIndex(row => row.contains(target));
            
            lines.forEach((line, i) => {
                const targetRowIndex = currentRowIndex + i;
                let row;
                if (targetRowIndex < rows.length) {
                    row = rows[targetRowIndex];
                } else {
                    entriesContainer.insertAdjacentHTML('beforeend', createRowHTML());
                    rows = Array.from(document.querySelectorAll('.tab3-entry'));
                    row = rows[rows.length - 1];
                }
                
                const input = row.querySelector('.tab3-time');
                input.value = line;
                calculateRow(row);
                formatTimeInput(input);
            });
            
            updateRemoveButtons();
            updateExport();
        }
    });

    entriesContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('tab3-time')) {
            const row = e.target.closest('.tab3-entry');
            calculateRow(row);
        } else if (e.target.classList.contains('tab3-name')) {
            updateExport();
        }
    });

    entriesContainer.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('tab3-time')) {
            formatTimeInput(e.target);
            const row = e.target.closest('.tab3-entry');
            calculateRow(row);
        }
    });

    exportFormatSelect.addEventListener('change', updateExport);

    copyBtn.addEventListener('click', () => {
        if (exportTextarea.value) {
            exportTextarea.select();
            document.execCommand('copy');
            
            // Visual feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#34d399" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>`;
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        }
    });

    // Initialize
    updateRemoveButtons();

    // Clear Button Logic
    const clearBtn = document.getElementById('clear-tab3-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const rows = document.querySelectorAll('.tab3-entry');
            rows.forEach((row, index) => {
                if (index === 0) {
                    row.querySelector('.tab3-time').value = '';
                    row.querySelector('.tab3-row-result').textContent = '0.00';
                } else {
                    row.remove();
                }
            });
            updateRemoveButtons();
            updateExport();
        });
    }
});
