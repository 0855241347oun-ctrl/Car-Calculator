document.addEventListener('DOMContentLoaded', () => {
    const tankSelect = document.getElementById('tab6-1-tank-select');
    const tankCustom = document.getElementById('tab6-1-tank-custom');
    const pctInput = document.getElementById('tab6-1-pct');
    const resultLiter = document.getElementById('tab6-1-liter-result');
    const clearBtn = document.getElementById('clear-tab6-1-btn');

    const calculate = () => {
        let maxTank = 0;

        if (tankSelect.value === 'custom') {
            tankCustom.classList.remove('hidden');
            maxTank = parseFloat(tankCustom.value) || 0;
        } else {
            tankCustom.classList.add('hidden');
            maxTank = parseFloat(tankSelect.value) || 0;
        }

        const pct = parseFloat(pctInput.value);

        if (maxTank > 0 && !isNaN(pct) && pct >= 0) {
            const liters = (pct / 100) * maxTank;
            resultLiter.textContent = liters.toFixed(2) + ' L';
        } else {
            resultLiter.textContent = '0.00 L';
        }
    };

    tankSelect.addEventListener('change', calculate);
    tankCustom.addEventListener('input', calculate);
    pctInput.addEventListener('input', calculate);

    clearBtn.addEventListener('click', () => {
        tankSelect.value = '620';
        tankCustom.value = '';
        tankCustom.classList.add('hidden');
        pctInput.value = '';
        resultLiter.textContent = '0.00 L';
    });

    // Copy result button
    const copyBtn = document.getElementById('copy-tab6-1-btn');
    const copyIcon = document.getElementById('copy-tab6-1-icon');
    const copyCheck = document.getElementById('copy-tab6-1-check');

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = resultLiter.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show check icon
                copyIcon.classList.add('hidden');
                copyCheck.classList.remove('hidden');
                copyBtn.classList.replace('text-zinc-400', 'text-green-400');
                copyBtn.classList.add('border-green-500/50', 'bg-green-500/10');

                // Reset after 2s
                setTimeout(() => {
                    copyIcon.classList.remove('hidden');
                    copyCheck.classList.add('hidden');
                    copyBtn.classList.replace('text-green-400', 'text-zinc-400');
                    copyBtn.classList.remove('border-green-500/50', 'bg-green-500/10');
                }, 2000);
            });
        });
    }
});
