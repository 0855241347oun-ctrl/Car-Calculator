document.addEventListener('DOMContentLoaded', () => {
    // --- SIDEBAR MENU LOGIC (Max 2 Active Tabs) ---
    const menuBtns = document.querySelectorAll('.menu-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    let activeTabs = ['tab-3'];

    const updateUI = () => {
        // Update menu buttons styling
        menuBtns.forEach(btn => {
            const targetId = btn.getAttribute('data-target');
            if (activeTabs.includes(targetId)) {
                btn.classList.add('active', 'border-indigo-500', 'bg-indigo-500/10', 'text-white', 'shadow-lg', 'shadow-indigo-500/5');
                btn.classList.remove('border-transparent', 'text-zinc-400', 'hover:text-zinc-200', 'hover:bg-zinc-800/40');
            } else {
                btn.classList.remove('active', 'border-indigo-500', 'bg-indigo-500/10', 'text-white', 'shadow-lg', 'shadow-indigo-500/5');
                btn.classList.add('border-transparent', 'text-zinc-400', 'hover:text-zinc-200', 'hover:bg-zinc-800/40');
            }
        });

        // Update content area visibility AND order
        const container = document.getElementById('tabs-content-container');
        tabContents.forEach(c => {
            if (activeTabs.includes(c.id)) {
                c.classList.remove('hidden');
                c.classList.add('block');
            } else {
                c.classList.remove('block');
                c.classList.add('hidden');
            }
        });

        // Reorder DOM to match activeTabs order (first clicked = leftmost)
        activeTabs.forEach(id => {
            const el = document.getElementById(id);
            if (el) container.appendChild(el); // move to end in order
        });

        // If 2 tabs are active, dynamically adjust grid on very large screens if needed
        // (Handled by Tailwind xl:grid-cols-2 in HTML)
    };

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            
            if (activeTabs.includes(targetId)) {
                // If it's already active, we can toggle it off, but require at least 1 active tab
                if (activeTabs.length > 1) {
                    activeTabs = activeTabs.filter(id => id !== targetId);
                }
            } else {
                // Not active, add it. Max 2 allowed.
                if (activeTabs.length >= 2) {
                    // Remove the oldest active tab to make room
                    activeTabs.shift();
                }
                activeTabs.push(targetId);
            }
            updateUI();
        });
    });

    // Initialize UI
    updateUI();
});
