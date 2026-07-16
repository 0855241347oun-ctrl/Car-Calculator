/**
 * Floating Calculator Window
 * Supports: + - * / %
 * Features: Draggable, Resizable, Minimizable
 */

(function () {
    'use strict';

    let calcOpen = false;
    let calcMinimized = false;
    let calcWindow = null;

    // ── State ──
    let display = '0';
    let previousValue = null;
    let operator = null;
    let waitingForOperand = false;
    let history = '';

    // ── Build the Calculator Window ──
    function createCalculator() {
        if (calcWindow) {
            calcWindow.style.display = 'flex';
            calcOpen = true;
            calcMinimized = false;
            // Re-show body & resize handle in case it was minimized
            const body = document.getElementById('calc-body');
            const resizeHandle = document.getElementById('calc-resize-handle');
            if (body) body.style.display = '';
            if (resizeHandle) resizeHandle.style.display = '';
            
            // Center the window on open
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const pad = 8;
            const winW = Math.min(340, vw - pad * 2);
            const winH = Math.min(520, vh - pad * 2);
            calcWindow.style.width = winW + 'px';
            calcWindow.style.height = winH + 'px';
            calcWindow.style.left = Math.max(pad, (vw - winW) / 2) + 'px';
            calcWindow.style.top = Math.max(pad, (vh - winH) / 2) + 'px';

            // Re-trigger entry animation
            requestAnimationFrame(() => {
                calcWindow.classList.add('calc-window-visible');
            });
            return;
        }

        // Overlay (transparent, just for z-index stacking)
        const win = document.createElement('div');
        win.id = 'calc-floating-window';
        win.innerHTML = `
            <div class="calc-titlebar" id="calc-titlebar">
                <div class="calc-titlebar-left">
                    <span class="calc-title-icon">🧮</span>
                    <span class="calc-title-text">เครื่องคิดเลข</span>
                </div>
                <div class="calc-titlebar-right">
                    <button class="calc-tb-btn calc-minimize-btn" id="calc-minimize-btn" title="ย่อหน้าต่าง">
                        <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="5.5" width="10" height="1.5" rx="0.5" fill="currentColor"/></svg>
                    </button>
                    <button class="calc-tb-btn calc-close-btn" id="calc-close-btn" title="ปิดหน้าต่าง">
                        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </div>
            <div class="calc-body" id="calc-body">
                <div class="calc-history" id="calc-history"></div>
                <div class="calc-display" id="calc-display">0</div>
                <div class="calc-keypad" id="calc-keypad">
                    <button class="calc-key calc-key-func" data-action="clear">C</button>
                    <button class="calc-key calc-key-func" data-action="sign">±</button>
                    <button class="calc-key calc-key-op" data-action="operator" data-value="%">%</button>
                    <button class="calc-key calc-key-op calc-key-op-primary" data-action="operator" data-value="÷">÷</button>

                    <button class="calc-key calc-key-num" data-action="digit" data-value="7">7</button>
                    <button class="calc-key calc-key-num" data-action="digit" data-value="8">8</button>
                    <button class="calc-key calc-key-num" data-action="digit" data-value="9">9</button>
                    <button class="calc-key calc-key-op calc-key-op-primary" data-action="operator" data-value="×">×</button>

                    <button class="calc-key calc-key-num" data-action="digit" data-value="4">4</button>
                    <button class="calc-key calc-key-num" data-action="digit" data-value="5">5</button>
                    <button class="calc-key calc-key-num" data-action="digit" data-value="6">6</button>
                    <button class="calc-key calc-key-op calc-key-op-primary" data-action="operator" data-value="−">−</button>

                    <button class="calc-key calc-key-num" data-action="digit" data-value="1">1</button>
                    <button class="calc-key calc-key-num" data-action="digit" data-value="2">2</button>
                    <button class="calc-key calc-key-num" data-action="digit" data-value="3">3</button>
                    <button class="calc-key calc-key-op calc-key-op-primary" data-action="operator" data-value="+">+</button>

                    <button class="calc-key calc-key-num calc-key-zero" data-action="digit" data-value="0">0</button>
                    <button class="calc-key calc-key-num" data-action="decimal">.</button>
                    <button class="calc-key calc-key-equals" data-action="equals">=</button>
                </div>
            </div>
            <div class="calc-resize-handle" id="calc-resize-handle"></div>
        `;

        document.body.appendChild(win);
        calcWindow = win;
        calcOpen = true;

        // Position & size – fit within viewport
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pad = 8;
        const winW = Math.min(340, vw - pad * 2);
        const winH = Math.min(520, vh - pad * 2);
        win.style.width = winW + 'px';
        win.style.height = winH + 'px';
        win.style.left = Math.max(pad, (vw - winW) / 2) + 'px';
        win.style.top = Math.max(pad, (vh - winH) / 2) + 'px';

        // ── Drag logic ──
        setupDrag(win, document.getElementById('calc-titlebar'));

        // ── Resize logic ──
        setupResize(win, document.getElementById('calc-resize-handle'));

        // ── Button actions ──
        document.getElementById('calc-close-btn').addEventListener('click', closeCalc);
        document.getElementById('calc-minimize-btn').addEventListener('click', minimizeCalc);

        // ── Keypad ──
        const keypad = document.getElementById('calc-keypad');
        keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.calc-key');
            if (!btn) return;
            const action = btn.dataset.action;
            const value = btn.dataset.value;

            // Ripple effect
            addRipple(btn, e);

            switch (action) {
                case 'digit': inputDigit(value); break;
                case 'decimal': inputDecimal(); break;
                case 'operator': handleOperator(value); break;
                case 'equals': handleEquals(); break;
                case 'clear': clearCalc(); break;
                case 'sign': toggleSign(); break;
            }
            updateDisplay();
        });

        // ── Keyboard support ──
        document.addEventListener('keydown', handleKeyboard);

        // Entry animation
        requestAnimationFrame(() => {
            win.classList.add('calc-window-visible');
        });
    }

    // ── Calculator Logic ──
    function inputDigit(digit) {
        if (waitingForOperand) {
            display = digit;
            waitingForOperand = false;
        } else {
            display = display === '0' ? digit : display + digit;
        }
    }

    function inputDecimal() {
        if (waitingForOperand) {
            display = '0.';
            waitingForOperand = false;
            return;
        }
        if (!display.includes('.')) {
            display += '.';
        }
    }

    function handleOperator(nextOp) {
        const inputValue = parseFloat(display);

        if (operator && !waitingForOperand) {
            const result = calculate(previousValue, inputValue, operator);
            display = formatResult(result);
            previousValue = result;
            history = `${formatResult(previousValue)} ${nextOp}`;
        } else {
            previousValue = inputValue;
            history = `${display} ${nextOp}`;
        }

        operator = nextOp;
        waitingForOperand = true;
    }

    function handleEquals() {
        if (operator === null || waitingForOperand) return;

        const inputValue = parseFloat(display);
        const result = calculate(previousValue, inputValue, operator);
        history = `${formatResult(previousValue)} ${operator} ${formatResult(inputValue)} =`;
        display = formatResult(result);
        previousValue = null;
        operator = null;
        waitingForOperand = true;
    }

    function calculate(a, b, op) {
        switch (op) {
            case '+': return a + b;
            case '−': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 'Error';
            case '%': return a % b;
            default: return b;
        }
    }

    function formatResult(val) {
        if (val === 'Error') return 'Error';
        if (typeof val !== 'number' || isNaN(val)) return 'Error';
        // Remove trailing zeros for decimals
        const str = parseFloat(val.toFixed(10)).toString();
        return str.length > 14 ? parseFloat(val.toPrecision(12)).toString() : str;
    }

    function clearCalc() {
        display = '0';
        previousValue = null;
        operator = null;
        waitingForOperand = false;
        history = '';
    }

    function toggleSign() {
        if (display === '0' || display === 'Error') return;
        display = display.charAt(0) === '-' ? display.slice(1) : '-' + display;
    }

    function updateDisplay() {
        const disp = document.getElementById('calc-display');
        const hist = document.getElementById('calc-history');
        if (disp) {
            disp.textContent = display;
            // Auto-shrink font for long numbers
            if (display.length > 10) {
                disp.style.fontSize = '1.6rem';
            } else if (display.length > 7) {
                disp.style.fontSize = '2rem';
            } else {
                disp.style.fontSize = '';
            }
        }
        if (hist) hist.textContent = history;

        // Highlight active operator
        document.querySelectorAll('.calc-key-op-primary').forEach(btn => {
            if (operator && btn.dataset.value === operator && waitingForOperand) {
                btn.classList.add('calc-key-op-active');
            } else {
                btn.classList.remove('calc-key-op-active');
            }
        });
    }

    // ── Keyboard handler ──
    function handleKeyboard(e) {
        if (!calcOpen || calcMinimized) return;
        const key = e.key;

        if (key >= '0' && key <= '9') { inputDigit(key); e.preventDefault(); }
        else if (key === '.') { inputDecimal(); e.preventDefault(); }
        else if (key === '+') { handleOperator('+'); e.preventDefault(); }
        else if (key === '-') { handleOperator('−'); e.preventDefault(); }
        else if (key === '*') { handleOperator('×'); e.preventDefault(); }
        else if (key === '/') { handleOperator('÷'); e.preventDefault(); }
        else if (key === '%') { handleOperator('%'); e.preventDefault(); }
        else if (key === 'Enter' || key === '=') { handleEquals(); e.preventDefault(); }
        else if (key === 'Escape') { clearCalc(); e.preventDefault(); }
        else if (key === 'Backspace') { backspace(); e.preventDefault(); }
        else { return; }

        updateDisplay();
    }

    function backspace() {
        if (waitingForOperand || display === 'Error') {
            display = '0';
            waitingForOperand = false;
        } else if (display.length === 1 || (display.length === 2 && display.charAt(0) === '-')) {
            display = '0';
        } else {
            display = display.slice(0, -1);
        }
    }

    // ── Drag ──
    function setupDrag(win, handle) {
        let isDragging = false;
        let startX, startY, origLeft, origTop;

        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag, { passive: false });

        function startDrag(e) {
            if (e.target.closest('.calc-tb-btn')) return;
            isDragging = true;
            const rect = win.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }
            win.style.transition = 'none';
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', onDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);
            e.preventDefault();
        }

        function onDrag(e) {
            if (!isDragging) return;
            let cx, cy;
            if (e.type === 'touchmove') {
                cx = e.touches[0].clientX;
                cy = e.touches[0].clientY;
            } else {
                cx = e.clientX;
                cy = e.clientY;
            }
            const dx = cx - startX;
            const dy = cy - startY;
            // Clamp so the window stays within the viewport
            const rect = win.getBoundingClientRect();
            const maxLeft = window.innerWidth - rect.width;
            const maxTop = window.innerHeight - rect.height;
            let newLeft = origLeft + dx;
            let newTop = origTop + dy;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            win.style.left = newLeft + 'px';
            win.style.top = newTop + 'px';
            e.preventDefault();
        }

        function stopDrag() {
            isDragging = false;
            win.style.transition = '';
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }

    // ── Resize ──
    function setupResize(win, handle) {
        let isResizing = false;
        let startX, startY, origW, origH;

        handle.addEventListener('mousedown', startResize);
        handle.addEventListener('touchstart', startResize, { passive: false });

        function startResize(e) {
            isResizing = true;
            const rect = win.getBoundingClientRect();
            origW = rect.width;
            origH = rect.height;
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }
            win.style.transition = 'none';
            document.addEventListener('mousemove', onResize);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchmove', onResize, { passive: false });
            document.addEventListener('touchend', stopResize);
            e.preventDefault();
        }

        function onResize(e) {
            if (!isResizing) return;
            let cx, cy;
            if (e.type === 'touchmove') {
                cx = e.touches[0].clientX;
                cy = e.touches[0].clientY;
            } else {
                cx = e.clientX;
                cy = e.clientY;
            }
            const newW = Math.max(280, origW + (cx - startX));
            const newH = Math.max(380, origH + (cy - startY));
            win.style.width = newW + 'px';
            win.style.height = newH + 'px';
            e.preventDefault();
        }

        function stopResize() {
            isResizing = false;
            win.style.transition = '';
            document.removeEventListener('mousemove', onResize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', onResize);
            document.removeEventListener('touchend', stopResize);
        }
    }

    // ── Ripple Effect ──
    function addRipple(btn, e) {
        const ripple = document.createElement('span');
        ripple.className = 'calc-ripple';
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    // ── Open / Close / Minimize ──
    function closeCalc() {
        if (calcWindow) {
            calcWindow.classList.remove('calc-window-visible');
            setTimeout(() => {
                calcWindow.style.display = 'none';
                calcOpen = false;
            }, 250);
        }
    }

    function minimizeCalc() {
        if (!calcWindow) return;
        const body = document.getElementById('calc-body');
        const resizeHandle = document.getElementById('calc-resize-handle');
        if (calcMinimized) {
            body.style.display = '';
            resizeHandle.style.display = '';
            calcWindow.style.height = '';
            calcMinimized = false;
        } else {
            body.style.display = 'none';
            resizeHandle.style.display = 'none';
            calcWindow.style.height = 'auto';
            calcMinimized = true;
        }
    }

    // ── Toggle (called from menu button) ──
    window.toggleFloatingCalculator = function () {
        if (calcOpen) {
            closeCalc();
        } else {
            clearCalc();
            createCalculator();
        }
    };
})();
