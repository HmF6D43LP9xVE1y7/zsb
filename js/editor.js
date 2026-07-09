

// ====== GRID DEBUG PANEL - COMPLETE WITH DRAG NO-SCROLL ======

(function() {
    let debugMode = true;
    let currentSelection = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let dragGridStart = { col: 1, row: 1 };
    let dragSpan = { cols: 1, rows: 1 };
    const GRID_SIZE = 60; // pixels per grid cell - adjust to your grid

    // ===== CONTROL PANEL =====
    const panel = document.createElement('div');
    panel.id = 'gridDebugPanel';
    Object.assign(panel.style, {
        position: 'fixed', top: '10px', left: '10px', zIndex: '999999',
        background: 'rgba(0,0,0,0.95)', color: '#ffffff', fontFamily: 'monospace',
        fontSize: '13px', padding: '15px', borderRadius: '6px', minWidth: '260px',
        display: 'none', lineHeight: '1.4', boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
    });

    panel.innerHTML = `
        <div id="debugTitle" style="font-weight:bold;margin-bottom:0px;font-size:0px;"></div>
        <div style="margin-bottom:8px">
            <label style="color:#ffffff;">Col: </label>
            <input id="colStart" type="number" min="1" style="width:50px;margin:0 3px;text-align:center;font-size:12px;color:#000;background:#fff;">
            <span style="color:#ffffff;">/</span>
            <input id="colEnd" type="number" min="1" style="width:50px;margin:0 3px;text-align:center;font-size:12px;color:#000;background:#fff;">
        </div>
        <div style="margin-bottom:12px">
            <label style="color:#ffffff;">Row: </label>
            <input id="rowStart" type="number" min="1" style="width:50px;margin:0 3px;text-align:center;font-size:12px;color:#000;background:#fff;">
            <span style="color:#ffffff;">/</span>
            <input id="rowEnd" type="number" min="1" style="width:50px;margin:0 3px;text-align:center;font-size:12px;color:#000;background:#fff;">
        </div>
        <div style="display:flex;gap:6px;font-size:12px;">
            <button id="moveLeft" style="background:#444;color:#fff;flex:1;padding:4px;">←</button>
            <button id="moveUp" style="background:#444;color:#fff;flex:1;padding:4px;">↑</button>
            <button id="moveDown" style="background:#444;color:#fff;flex:1;padding:4px;">↓</button>
            <button id="moveRight" style="background:#444;color:#fff;flex:1;padding:4px;">→</button>
            <button id="clearBtn" style="background:#ff4444;color:#fff;flex:1;padding:4px;">Clear</button>
        </div>`;
    document.body.appendChild(panel);

    // Elements
    const titleEl = panel.querySelector('#debugTitle');
    const colStart = panel.querySelector('#colStart');
    const colEnd = panel.querySelector('#colEnd');
    const rowStart = panel.querySelector('#rowStart');
    const rowEnd = panel.querySelector('#rowEnd');
    const moveLeft = panel.querySelector('#moveLeft');
    const moveUp = panel.querySelector('#moveUp');
    const moveDown = panel.querySelector('#moveDown');
    const moveRight = panel.querySelector('#moveRight');
    const clearBtn = panel.querySelector('#clearBtn');

    // ===== ELEMENT PREPARATION =====
    function prepareElements() {
        // Images
        document.querySelectorAll('.imgContainer').forEach(el => {
            el.style.cursor = 'pointer';
            el.style.pointerEvents = 'auto';
            
            el.addEventListener('click', handleElementClick, true);
            el.addEventListener('mousedown', handleMouseDown, true);
        });

        // Text elements
        document.querySelectorAll('.textWrapper, .stickyContainer').forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'pointer';
            el.style.userSelect = 'none';
            el.style.WebkitUserSelect = 'none';

            el.querySelectorAll('*').forEach(child => {
                child.style.pointerEvents = 'none';
                child.style.userSelect = 'none';
            });

            el.addEventListener('click', handleElementClick, true);
            el.addEventListener('mousedown', handleMouseDown, true);
        });
    }

    // ===== SELECTION =====
    function selectElement(el) {
        // Clear previous
        if (currentSelection) {
            currentSelection.style.outline = '';
            currentSelection.style.outlineOffset = '';
        }

        currentSelection = el;
        currentSelection.style.outline = '4px solid #ff00ff';
        currentSelection.style.outlineOffset = '3px';

        // Read current position
        const col = el.style.gridColumn || el.dataset.desktopCol || '1 / 2';
        const row = el.style.gridRow || el.dataset.desktopRow || '1 / 2';
        const [cs, ce] = col.split('/').map(n => parseInt(n.trim()) || 1);
        const [rs, re] = row.split('/').map(n => parseInt(n.trim()) || 1);

        colStart.value = cs;
        colEnd.value = ce;
        rowStart.value = rs;
        rowEnd.value = re;

        titleEl.textContent = el.classList.contains('imgContainer') ? 'IMAGE' : 'TEXT';
        panel.style.display = 'block';
    }

    // ===== DRAG HANDLERS =====
    function handleElementClick(e) {
        if (!debugMode) return;
        e.stopPropagation();
        e.preventDefault();
        selectElement(e.currentTarget);
    }

    function handleMouseDown(e) {
        if (!debugMode || !currentSelection || e.target !== currentSelection) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // *** DISABLE SCROLL DURING DRAG ***
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        isDragging = true;
        dragOffset.x = e.clientX;
        dragOffset.y = e.clientY;
        
        dragGridStart.col = parseInt(colStart.value) || 1;
        dragGridStart.row = parseInt(rowStart.value) || 1;
        dragSpan.cols = (parseInt(colEnd.value) || 2) - dragGridStart.col;
        dragSpan.rows = (parseInt(rowEnd.value) || 2) - dragGridStart.row;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isDragging || !currentSelection) return;

        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;

        const gridMoveX = Math.round(deltaX / GRID_SIZE);
        const gridMoveY = Math.round(deltaY / GRID_SIZE);

        const newCol = Math.max(1, dragGridStart.col + gridMoveX);
        const newRow = Math.max(1, dragGridStart.row + gridMoveY);

        colStart.value = newCol;
        colEnd.value = newCol + dragSpan.cols;
        rowStart.value = newRow;
        rowEnd.value = newRow + dragSpan.rows;

        updatePosition();
    }

    function handleMouseUp() {
        isDragging = false;
        
        // *** RESTORE SCROLLING ***
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // ===== POSITION UPDATE =====
    function updatePosition() {
        if (!currentSelection) return;
        
        const cs = Math.max(1, parseInt(colStart.value) || 1);
        const ce = Math.max(cs, parseInt(colEnd.value) || cs);
        const rs = Math.max(1, parseInt(rowStart.value) || 1);
        const re = Math.max(rs, parseInt(rowEnd.value) || rs);

        currentSelection.style.gridColumn = `${cs} / ${ce}`;
        currentSelection.style.gridRow = `${rs} / ${re}`;
        currentSelection.dataset.desktopCol = `${cs} / ${ce}`;
        currentSelection.dataset.desktopRow = `${rs} / ${re}`;
    }

    // ===== CONTROLS =====
    function setupControls() {
        moveLeft.onclick = () => {
            if (!currentSelection) return;
            const cs = parseInt(colStart.value) || 1;
            colStart.value = Math.max(1, cs - 1);
            colEnd.value = parseInt(colEnd.value) - 1;
            updatePosition();
        };

        moveRight.onclick = () => {
            if (!currentSelection) return;
            colStart.value = (parseInt(colStart.value) || 1) + 1;
            colEnd.value = (parseInt(colEnd.value) || 2) + 1;
            updatePosition();
        };

        moveUp.onclick = () => {
            if (!currentSelection) return;
            const rs = parseInt(rowStart.value) || 1;
            rowStart.value = Math.max(1, rs - 1);
            rowEnd.value = parseInt(rowEnd.value) - 1;
            updatePosition();
        };

        moveDown.onclick = () => {
            if (!currentSelection) return;
            rowStart.value = (parseInt(rowStart.value) || 1) + 1;
            rowEnd.value = (parseInt(rowEnd.value) || 2) + 1;
            updatePosition();
        };

        clearBtn.onclick = () => {
            if (currentSelection) {
                currentSelection.style.outline = '';
                currentSelection.style.outlineOffset = '';
                currentSelection = null;
            }
            panel.style.display = 'none';
        };

        [colStart, colEnd, rowStart, rowEnd].forEach(input => {
            input.oninput = input.onchange = updatePosition;
        });
    }

    // ===== OUTSIDE CLICK =====
    document.addEventListener('click', e => {
        if (currentSelection && !panel.contains(e.target) && !currentSelection.contains(e.target)) {
            clearBtn.click();
        }
    });

    // ===== INIT =====
    function init() {
        setupControls();
        setTimeout(prepareElements, 200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('resize', () => setTimeout(prepareElements, 200));
})();


