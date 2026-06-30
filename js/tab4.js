document.addEventListener('DOMContentLoaded', () => {
    // --- TAB 4 (FUEL CALCULATOR) LOGIC ---
    const lphInput    = document.getElementById('tab4-lph');
    const hoursInput  = document.getElementById('tab4-hours');
    const fuelPctInput = document.getElementById('tab4-fuel-pct');
    const tankSelect  = document.getElementById('tab4-tank');
    const resultSection = document.getElementById('tab4-result');
    const litersUsedEl = document.getElementById('tab4-liters-used');
    const pctUsedEl   = document.getElementById('tab4-pct-used');
    const pctRemainEl = document.getElementById('tab4-pct-remain');

    if (!lphInput) return;

    const calculate = () => {
        const lph       = parseFloat(lphInput.value);
        const hours     = parseFloat(hoursInput.value);
        const fuelPct   = parseFloat(fuelPctInput.value);
        const tankSize  = parseFloat(tankSelect.value);

        // Need at least lph and hours to show result
        if (isNaN(lph) || isNaN(hours)) {
            resultSection.classList.remove('opacity-100');
            setTimeout(() => resultSection.classList.add('hidden'), 300);
            return;
        }

        // Step 1: liters used = L/H × hours
        const litersUsed = lph * hours;

        // Step 2: % fuel used = (litersUsed / tankSize) × 100
        const pctUsed = (litersUsed / tankSize) * 100;

        // Step 3: % remaining = original % − % used
        const pctRemain = isNaN(fuelPct) ? null : (fuelPct - pctUsed);

        litersUsedEl.textContent = litersUsed.toFixed(2);
        pctUsedEl.textContent    = pctUsed.toFixed(2);

        if (pctRemain !== null) {
            pctRemainEl.textContent = pctRemain.toFixed(2);
            // Color feedback: red if negative
            pctRemainEl.className = pctRemain < 0
                ? 'text-xl font-bold text-red-400'
                : 'text-xl font-bold text-emerald-400';
        } else {
            pctRemainEl.textContent = '—';
            pctRemainEl.className = 'text-xl font-bold text-gray-500';
        }

        resultSection.classList.remove('hidden');
        setTimeout(() => resultSection.classList.add('opacity-100'), 10);
    };

    [lphInput, hoursInput, fuelPctInput, tankSelect].forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
    });

    // Clear Button Logic
    const clearBtn = document.getElementById('clear-tab4-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            lphInput.value = '';
            hoursInput.value = '';
            fuelPctInput.value = '';
            calculate();
        });
    }
});
