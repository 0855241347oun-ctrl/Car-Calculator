document.addEventListener('DOMContentLoaded', () => {
    // --- TAB 3 (TIME TO DECIMAL HOURS) LOGIC ---
    const entriesContainer  = document.getElementById('tab3-entries');
    const addBtn            = document.getElementById('add-tab3-btn');
    const exportFormatSelect= document.getElementById('tab3-export-format');
    const exportTextarea    = document.getElementById('tab3-export-text');
    const copyBtn           = document.getElementById('tab3-copy-btn');

    if (!entriesContainer) return;

    // ── Mode ──────────────────────────────────────────────────────────────────
    const btn1col      = document.getElementById('tab3-mode-1col');
    const btn2col      = document.getElementById('tab3-mode-2col');
    const hint1col     = document.getElementById('tab3-hint-1col');
    const hint2col     = document.getElementById('tab3-hint-2col');
    const colHeaders   = document.getElementById('tab3-col-headers');
    let   is2col       = false;

    const applyMode = () => {
        // toggle kml columns on all rows
        document.querySelectorAll('.tab3-kml-col').forEach(el => {
            if (is2col) el.classList.replace('hidden', 'flex');
            else        el.classList.replace('flex',   'hidden');
        });
        // toggle headers & hints
        colHeaders.classList.toggle('hidden', !is2col);
        hint1col.classList.toggle('hidden',  is2col);
        hint2col.classList.toggle('hidden',  !is2col);
        // toggle button styles
        btn1col.classList.toggle('bg-indigo-600', !is2col);
        btn1col.classList.toggle('text-white',    !is2col);
        btn1col.classList.toggle('shadow-sm',     !is2col);
        btn1col.classList.toggle('text-zinc-400',  is2col);
        btn2col.classList.toggle('bg-indigo-600',  is2col);
        btn2col.classList.toggle('text-white',     is2col);
        btn2col.classList.toggle('shadow-sm',      is2col);
        btn2col.classList.toggle('text-zinc-400',  !is2col);
        updateExport();
    };

    btn1col.addEventListener('click', () => { is2col = false; applyMode(); });
    btn2col.addEventListener('click', () => { is2col = true;  applyMode(); });

    // ── Row template ──────────────────────────────────────────────────────────
    const createRowHTML = () => `
        <div class="tab3-entry flex items-center gap-3 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800 relative hover:border-zinc-700 transition-all">
            <button type="button" class="tab3-remove-btn w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hidden shrink-0 rounded-lg hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
            </button>
            <input type="text" placeholder="15:10 หรือ 53 นาที"
                class="tab3-time flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm font-mono placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors">
            <span class="tab3-row-result w-20 text-right text-xl font-bold text-indigo-400 font-mono shrink-0 tabular-nums">0.00</span>
            <!-- kml column (hidden in 1-col mode) -->
            <div class="tab3-kml-col ${is2col ? 'flex' : 'hidden'} items-center gap-2 shrink-0">
                <div class="w-px h-6 bg-zinc-800"></div>
                <input type="text" placeholder="กม./ล."
                    class="tab3-kml w-32 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-emerald-300 text-sm font-mono placeholder-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>
            <!-- row copy button (always at the very end) -->
            <div class="flex items-center gap-2 shrink-0">
                <div class="w-px h-6 bg-zinc-800"></div>
                <button type="button" class="tab3-copy-row-btn w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-950/40 hover:bg-indigo-600 border border-zinc-800 rounded-lg transition-all active:scale-95 shadow-inner" title="คัดลอกแถวนี้">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>
                </button>
            </div>
        </div>
    `;

    // ── Time parsing ──────────────────────────────────────────────────────────
    const parseTimeToMinutes = (val) => {
        if (!val) return null;
        val = val.trim();

        // Thai format: "7 ชม. 58 นาที" / "7 ชั่วโมง 58 นาที" / "58 นาที"
        if (val.includes('ชม') || val.includes('ชั่วโมง') || val.includes('นาที')) {
            let h = 0, m = 0;
            const hMatch = val.match(/(\d+)\s*(?:ชม|ชั่วโมง)/);
            if (hMatch) h = parseInt(hMatch[1], 10);
            const mMatch = val.match(/(\d+)\s*นาที/);
            if (mMatch) m = parseInt(mMatch[1], 10);
            return (h * 60) + m;
        }

        // HH:MM
        if (val.includes(':')) {
            const [h, m] = val.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) return (h * 60) + m;
        }

        // plain number
        const clean = val.replace(/\D/g, '');
        if (clean.length > 0) {
            if (clean.length <= 2) return parseInt(clean, 10) * 60;
            return (parseInt(clean.slice(0, -2), 10) * 60) + parseInt(clean.slice(-2), 10);
        }
        return null;
    };

    const formatTimeInput = (input) => {
        const val = input.value.trim();
        if (!val) return;

        if (val.includes('ชม') || val.includes('ชั่วโมง') || val.includes('นาที')) {
            let h = 0, m = 0;
            const hMatch = val.match(/(\d+)\s*(?:ชม|ชั่วโมง)/);
            if (hMatch) h = parseInt(hMatch[1], 10);
            const mMatch = val.match(/(\d+)\s*นาที/);
            if (mMatch) m = parseInt(mMatch[1], 10);
            input.value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            return;
        }
        if (val.includes(':')) {
            const [h, m] = val.split(':');
            input.value = `${h.padStart(2,'0')}:${m ? m.padStart(2,'0') : '00'}`;
        } else {
            const clean = val.replace(/\D/g, '');
            if (clean.length > 0) {
                input.value = clean.length <= 2
                    ? `${clean.padStart(2,'0')}:00`
                    : `${clean.slice(0,-2).padStart(2,'0')}:${clean.slice(-2)}`;
            }
        }
    };

    const calculateRow = (row) => {
        const timeInput  = row.querySelector('.tab3-time');
        const resultSpan = row.querySelector('.tab3-row-result');
        const mins       = parseTimeToMinutes(timeInput.value);
        resultSpan.textContent = mins !== null ? (mins / 60).toFixed(2) : '0.00';
        updateExport();
    };

    // ── Tooltip notifier ──────────────────────────────────────────────────────
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

    // ── Export ────────────────────────────────────────────────────────────────
    const updateExport = () => {
        const format = exportFormatSelect.value;
        const rows   = document.querySelectorAll('.tab3-entry');
        const data   = [];

        rows.forEach(row => {
            const decimal  = row.querySelector('.tab3-row-result').textContent;
            const timeVal  = row.querySelector('.tab3-time').value.trim();
            const kmlInput = row.querySelector('.tab3-kml');
            const kmlVal   = kmlInput ? kmlInput.value.trim() : '';

            const hasData = decimal !== '0.00' || timeVal !== '' || kmlVal !== '';
            if (!hasData) return;

            if (is2col) {
                data.push(`${decimal}\t${kmlVal}`);
            } else {
                data.push(decimal);
            }
        });

        if (data.length === 0) { exportTextarea.value = ''; return; }
        exportTextarea.value = format === 'vertical' ? data.join('\n') : data.join('\t');
    };

    // ── Remove button visibility ──────────────────────────────────────────────
    const updateRemoveButtons = () => {
        const rows = document.querySelectorAll('.tab3-entry');
        rows.forEach(row => {
            row.querySelector('.tab3-remove-btn').classList.toggle('hidden', rows.length === 1);
        });
    };

    // ── Add button ────────────────────────────────────────────────────────────
    addBtn.addEventListener('click', () => {
        entriesContainer.insertAdjacentHTML('beforeend', createRowHTML());
        updateRemoveButtons();
        updateExport();
        entriesContainer.scrollTop = entriesContainer.scrollHeight;
    });

    // ── Remove row & Copy result ──────────────────────────────────────────────
    entriesContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.tab3-remove-btn');
        if (removeBtn) {
            const row = removeBtn.closest('.tab3-entry');
            if (document.querySelectorAll('.tab3-entry').length > 1) {
                row.remove();
                updateRemoveButtons();
                updateExport();
            }
            return;
        }

        const copyRowBtn = e.target.closest('.tab3-copy-row-btn');
        if (copyRowBtn) {
            const row = copyRowBtn.closest('.tab3-entry');
            if (row) {
                const decimal = row.querySelector('.tab3-row-result').textContent.trim();
                const kmlInput = row.querySelector('.tab3-kml');
                const kml = kmlInput ? kmlInput.value.trim() : '';

                const textToCopy = is2col ? `${decimal}\t${kml}` : decimal;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    showTooltip(copyRowBtn, 'คัดลอกแล้ว!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        }
    });

    // ── Paste handler ─────────────────────────────────────────────────────────
    // Handles:
    //   • single-column paste (time values only, one per line)
    //   • two-column paste from Excel (time \t kml, one row per line)
    entriesContainer.addEventListener('paste', (e) => {
        const target = e.target;
        if (!target.classList.contains('tab3-time') && !target.classList.contains('tab3-kml')) return;

        const pasteData = (e.clipboardData || window.clipboardData).getData('text');
        if (!pasteData) return;

        const lines = pasteData.split(/\r\n|\n|\r/).map(l => l.trimEnd()).filter(l => l.length > 0);
        if (lines.length === 0) return;

        const hasTabs = lines.some(l => l.includes('\t'));
        const isMultipleLines = lines.length > 1;

        // If it's a simple single line without tab separators, let browser handle normal paste behavior
        if (!isMultipleLines && !hasTabs) {
            return;
        }

        e.preventDefault();

        let rows = Array.from(document.querySelectorAll('.tab3-entry'));
        const currentRowIndex = rows.findIndex(row => row.contains(target));

        lines.forEach((line, i) => {
            const targetIdx = currentRowIndex + i;

            // Add rows as needed
            if (targetIdx >= rows.length) {
                entriesContainer.insertAdjacentHTML('beforeend', createRowHTML());
                rows = Array.from(document.querySelectorAll('.tab3-entry'));
            }

            const row = rows[targetIdx];

            if (hasTabs || is2col) {
                // Split on first tab only → timeStr | kmlStr
                const tabIdx = line.indexOf('\t');
                const timeStr = tabIdx >= 0 ? line.slice(0, tabIdx).trim() : line.trim();
                const kmlStr  = tabIdx >= 0 ? line.slice(tabIdx + 1).trim() : '';

                const timeInput = row.querySelector('.tab3-time');
                if (timeInput) {
                    timeInput.value = timeStr;
                    calculateRow(row);
                    formatTimeInput(timeInput);
                }

                const kmlInput = row.querySelector('.tab3-kml');
                if (kmlInput) kmlInput.value = kmlStr;

                // Auto-switch to 2-col mode if not already
                if (!is2col && tabIdx >= 0 && kmlStr !== '') {
                    is2col = true;
                    applyMode();
                }
            } else {
                // Multiple lines but no tabs
                const timeInput = row.querySelector('.tab3-time');
                if (timeInput) {
                    timeInput.value = line.trim();
                    calculateRow(row);
                    formatTimeInput(timeInput);
                }
            }
        });

        updateRemoveButtons();
        updateExport();
    });

    // ── Input events ──────────────────────────────────────────────────────────
    entriesContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('tab3-time')) {
            calculateRow(e.target.closest('.tab3-entry'));
        } else if (e.target.classList.contains('tab3-kml')) {
            updateExport();
        }
    });

    entriesContainer.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('tab3-time')) {
            formatTimeInput(e.target);
            calculateRow(e.target.closest('.tab3-entry'));
        }
    });

    // ── Export format ─────────────────────────────────────────────────────────
    exportFormatSelect.addEventListener('change', updateExport);

    // ── Copy ──────────────────────────────────────────────────────────────────
    copyBtn.addEventListener('click', () => {
        if (!exportTextarea.value) return;
        exportTextarea.select();
        document.execCommand('copy');
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#34d399" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>`;
        setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
    });

    // ── Clear ─────────────────────────────────────────────────────────────────
    const clearBtn = document.getElementById('clear-tab3-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const rows = document.querySelectorAll('.tab3-entry');
            rows.forEach((row, i) => {
                if (i === 0) {
                    row.querySelector('.tab3-time').value = '';
                    row.querySelector('.tab3-row-result').textContent = '0.00';
                    const kml = row.querySelector('.tab3-kml');
                    if (kml) kml.value = '';
                } else {
                    row.remove();
                }
            });
            updateRemoveButtons();
            updateExport();
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    updateRemoveButtons();
});
