document.addEventListener('DOMContentLoaded', () => {
    const tankSelect = document.getElementById('tab5-2-tank-select');
    const tankCustom = document.getElementById('tab5-2-tank-custom');
    const litersInput = document.getElementById('tab5-2-liters');
    const resultPct = document.getElementById('tab5-2-pct-result');
    const clearBtn = document.getElementById('clear-tab5-2-2-btn');

    const calculate = () => {
        let maxTank = 0;
        
        if (tankSelect.value === 'custom') {
            tankCustom.classList.remove('hidden');
            maxTank = parseFloat(tankCustom.value) || 0;
        } else {
            tankCustom.classList.add('hidden');
            maxTank = parseFloat(tankSelect.value) || 0;
        }

        const liters = parseFloat(litersInput.value);
        
        if (maxTank > 0 && !isNaN(liters) && liters >= 0) {
            const pct = (liters / maxTank) * 100;
            // Prevent going over 100% if they input more liters than max tank? 
            // The prompt didn't say to cap it, so we'll just show the raw percentage.
            resultPct.textContent = pct.toFixed(2) + '%';
        } else {
            resultPct.textContent = '0.00%';
        }
    };

    tankSelect.addEventListener('change', calculate);
    tankCustom.addEventListener('input', calculate);
    litersInput.addEventListener('input', calculate);

    clearBtn.addEventListener('click', () => {
        tankSelect.value = '400';
        tankCustom.value = '';
        tankCustom.classList.add('hidden');
        litersInput.value = '';
        resultPct.textContent = '0.00%';
    });

    // Copy result button
    const copyBtn = document.getElementById('copy-tab5-2-2-btn');
    const copyIcon = document.getElementById('copy-tab5-2-2-icon');
    const copyCheck = document.getElementById('copy-tab5-2-2-check');

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = resultPct.textContent;
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
