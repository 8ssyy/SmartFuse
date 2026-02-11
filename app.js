// --- DATA STORE ---
const STORE = {
    currentUser: null,
    panels: [
        { id: 'TGBT', name: 'Tablero General (TGBT)', type: 'root' },
        { id: 'TS-01', name: 'Tablero Seccional 01', parent: 'TGBT' },
        { id: 'TS-02', name: 'Tablero Seccional 02', parent: 'TGBT' }
    ],
    fuses: [
        {
            id: 'SF-1001',
            type: 'NH00',
            curve: 'aM',
            amps: 63,
            model: 'NH00 aM 63A',
            panel: 'TS-01',
            machinery: ['Compresor A1'],
            status: 'OK',
            lifecycle: 'installed',
            lastCheck: '2023-10-25',
            condition: 'Operativo',
            maintReq: false,
            responsible: 'M. López',
            notes: [
                { id: 1, text: 'Instalación inicial.', user: 'M. López', date: '2023-10-25 09:00', status: 'completed' }
            ]
        },
        {
            id: 'SF-1002',
            type: 'NH00',
            curve: 'gG',
            amps: 63,
            model: 'NH00 gG 63A',
            panel: 'TS-02',
            machinery: ['Iluminación Nave 2'],
            status: 'WARN',
            lifecycle: 'installed',
            lastCheck: '2023-10-26',
            condition: 'En Observación',
            maintReq: true,
            responsible: 'J. Pérez',
            notes: [
                { id: 1, text: 'Revisar contactos por leve sulfatación.', user: 'J. Pérez', date: '2023-10-26 14:30', status: 'pending' }
            ]
        },
        { id: 'SF-1003', type: 'NH00', curve: 'aM', amps: 100, model: 'NH00 aM 100A', panel: 'TS-01', machinery: ['Cinta Transportadora'], status: 'OK', lifecycle: 'installed', lastCheck: '2023-10-25', condition: 'Operativo', maintReq: false, responsible: 'M. López', notes: [] },
        { id: 'SF-1004', type: 'NH00', curve: 'gG', amps: 32, model: 'NH00 gG 32A', panel: 'TS-02', machinery: ['Ventilación'], status: 'OK', lifecycle: 'installed', lastCheck: '2023-10-25', condition: 'Operativo', maintReq: false, responsible: 'M. López', notes: [] },
        { id: 'SF-MAIN-01', type: 'NH01', curve: 'aM', amps: 250, model: 'NH01 aM 250A', panel: 'TGBT', machinery: ['Sector A Completo'], status: 'OK', lifecycle: 'installed', lastCheck: '2023-10-20', condition: 'Operativo', maintReq: false, responsible: 'Ing. A. Martínez', notes: [{ id: 1, text: 'Fusible principal.', user: 'A. Martínez', date: '2023-10-20 08:00', status: 'completed' }] }
    ],
    requests: [
        { id: 'REQ-01', date: '2023-10-28', item: 'NH01 gG 100A', qty: 2, priority: 'Alta', status: 'Pendiente', dest: 'Sec-A', reason: 'Stock crítico' },
        { id: 'REQ-02', date: '2023-10-29', item: 'NH00 aM 63A', qty: 1, priority: 'Baja', status: 'Aprobado', dest: 'Almacén', reason: 'Repuesto' }
    ],
    history: [
        { id: 1, date: 'Hace 5 min', user: 'admin', action: 'Login', type: 'info', details: 'Ingreso al sistema.' },
        { id: 2, date: 'Hace 2 horas', user: 'sys', action: 'Alerta Estado SF-1002', type: 'warn', details: 'Cambio de estado automático a WARN.' },
        { id: 3, date: 'Ayer 14:00', user: 'j.perez', action: 'Cambio Fusible SF-1001', type: 'success', details: 'Reemplazo preventivo.' }
    ]
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // [LIMPIEZA] Borra esto si quieres que la sesión se mantenga al recargar, 
    // pero déjalo la primera vez para limpiar los datos corruptos.
    sessionStorage.clear();
    // [FIX] Force clear of potentially corrupted data
    localStorage.clear();

    const session = sessionStorage.getItem('sf_session');
    if (session) {
        loginSuccess(JSON.parse(session));
    } else {
        // Ensure nav is hidden if not logged in
        const nav = document.getElementById('mobileNavBar');
        if (nav) nav.classList.add('hidden');
    }
    if (document.getElementById('topology-container')) {
        renderTopology();
    }
});

// --- AUTH ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const roleInput = document.getElementById('userRoleSelect').value;
        const passwordInput = document.getElementById('password').value;

        // SIMULATED LOGIN
        if (usernameInput && passwordInput) {
            // Generate Initials
            const words = usernameInput.split(' ');
            let initials = '';
            if (words.length > 1) {
                initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
            } else {
                initials = usernameInput.substring(0, 2).toUpperCase();
            }

            const user = {
                name: usernameInput,
                role: roleInput,
                initials: initials
            };

            sessionStorage.setItem('sf_session', JSON.stringify(user));
            loginSuccess(user);
        } else {
            showToast('Clave Incorrecta (Prueba 1234)', 'error');
            document.getElementById('password').value = '';
            document.getElementById('login-view').classList.add('animate-shake');
            setTimeout(() => document.getElementById('login-view').classList.remove('animate-shake'), 500);
        }
    });
}

function loginSuccess(user) {
    STORE.currentUser = user;

    // UI Updates
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userInitials').textContent = user.initials;

    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('flex');

    navigate('overview');
    updateHistory();
    updateHistory();
    renderRequests();
    renderTopology();
    renderAddFusePanelOptions();
    renderDashboard();

    // Show Mobile Nav
    const mobileNav = document.getElementById('mobileNavBar');
    if (mobileNav) {
        mobileNav.classList.remove('hidden');
        mobileNav.classList.add('flex');
    }
}

function logout() {
    sessionStorage.removeItem('sf_session');

    // Hide Mobile Nav
    const mobileNav = document.getElementById('mobileNavBar');
    if (mobileNav) {
        mobileNav.classList.add('hidden');
        mobileNav.classList.remove('flex');
    }

    location.reload();
}

// --- NAVIGATION ---
window.navigate = function (viewId, el) {
    if (el) {
        document.querySelectorAll('.nav-link').forEach(n => {
            n.classList.remove('active', 'border-accent', 'bg-white/5', 'text-white');
            n.classList.add('border-transparent', 'text-textMuted');
        });
        el.classList.remove('border-transparent', 'text-textMuted');
        el.classList.add('active', 'border-accent', 'bg-white/5', 'text-white');
    }

    document.querySelectorAll('.section-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.remove('hidden');

    if (viewId === 'overview') renderDashboard();
    if (viewId === 'stock') renderStock();
    if (viewId === 'requests') renderRequests();
    if (viewId === 'add_fuse') renderAddFusePanelOptions();
    if (viewId === 'feedback') renderFeedback();

    const titles = {
        overview: 'Resumen Operativo',
        diagram: 'Diagrama unifilar de la planta',
        search: 'Búsqueda & Escaneo',
        requests: 'Gestión de Pedidos',
        history: 'Historial del Sistema',
        add_fuse: 'Agregar Fusible',
        feedback: 'Comentarios al Fabricante'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[viewId] || 'SmartFuse';

    if (window.innerWidth < 1024) {
        const sb = document.getElementById('sidebar');
        const ov = document.getElementById('sidebarOverlay');
        if (sb) sb.classList.add('-translate-x-full');
        if (ov) ov.classList.add('hidden');
    }
};

window.toggleSidebar = function () {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');

    if (sb.classList.contains('-translate-x-full')) {
        sb.classList.remove('-translate-x-full');
        ov.classList.remove('hidden');
    } else {
        sb.classList.add('-translate-x-full');
        ov.classList.add('hidden');
    }
};

// --- DASHBOARD ---
function renderDashboard() {
    // 1. Calculate Counters
    const total = STORE.fuses.length;
    const ok = STORE.fuses.filter(f => f.status === 'OK').length;
    const warn = STORE.fuses.filter(f => f.status === 'WARN').length;
    const crit = STORE.fuses.filter(f => f.status === 'CRIT' || f.condition === 'Reemplazo Próximo').length;
    const pendingRequests = STORE.requests.filter(r => r.status === 'Pendiente').length;

    let pendingNotes = 0;
    STORE.fuses.forEach(f => {
        if (f.notes) {
            pendingNotes += f.notes.filter(n => n.status === 'pending').length;
        }
    });

    // 2. Update Counters
    document.getElementById('dash-total').textContent = total;
    document.getElementById('dash-ok').textContent = ok;
    document.getElementById('dash-warn').textContent = warn;
    document.getElementById('dash-crit').textContent = crit;
    document.getElementById('dash-notes-count').textContent = pendingNotes;
    document.getElementById('dash-req-count').textContent = pendingRequests;

    // 3. Render Critical List
    const critListEl = document.getElementById('dash-crit-list');
    if (critListEl) {
        critListEl.innerHTML = '';
        const critFuses = STORE.fuses.filter(f => f.status === 'CRIT' || f.condition === 'Reemplazo Próximo');

        if (critFuses.length === 0) {
            critListEl.innerHTML = '<div class="p-4 text-center text-xs text-textMuted italic font-mono animate-fadeInUp">Sin alarmas activas.</div>';
        } else {
            critFuses.forEach((f, index) => {
                const p = STORE.panels.find(pl => pl.id === f.panel);
                critListEl.innerHTML += `
                    <div class="flex items-center justify-between border-b border-borderMain p-3 hover:bg-red-500/10 cursor-pointer group transition-colors animate-fadeInUp" style="animation-delay: ${index * 50}ms" onclick="showFuseDetail('${f.id}')">
                        <div>
                            <div class="font-mono text-white text-xs font-bold text-danger group-hover:text-red-400">${f.id}</div>
                            <div class="text-[10px] text-textMuted uppercase">${p ? p.name : f.panel}</div>
                        </div>
                        <div class="text-right">
                             <span class="text-[10px] text-danger border border-danger px-2 py-0.5 rounded-sm uppercase">Revisar</span>
                        </div>
                    </div>
                `;
            });
        }
    }
}

// --- PENDING NOTES MODAL ---
window.showPendingNotes = function () {
    const container = document.getElementById('pendingNotesContent');
    const modal = document.getElementById('pendingNotesModal');

    if (!container || !modal) return;

    container.innerHTML = '';

    let allPending = [];
    STORE.fuses.forEach(f => {
        if (f.notes) {
            f.notes.filter(n => n.status === 'pending').forEach(n => {
                allPending.push({ note: n, fuse: f });
            });
        }
    });

    // Sort by Date (Newest first)
    allPending.sort((a, b) => new Date(b.note.id) - new Date(a.note.id));

    if (allPending.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-textMuted italic animate-fadeInUp">No hay anotaciones pendientes.</div>';
    } else {
        allPending.forEach((item, index) => {
            const p = STORE.panels.find(pl => pl.id === item.fuse.panel);
            container.innerHTML += `
                <div class="border-b border-borderMain p-4 hover:bg-white/5 transition-colors animate-fadeInUp" style="animation-delay: ${index * 50}ms">
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-xs text-accent font-bold uppercase tracking-wide mb-1">${item.note.user} • ${item.note.date}</div>
                        <button onclick="closePendingNotesModal(); showFuseDetail('${item.fuse.id}')" class="text-[10px] border border-borderMain hover:bg-accent hover:border-accent hover:text-white px-2 py-1 transition-colors uppercase active:scale-95 transform">
                            Ver Fusible <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <div class="mb-2">
                        <p class="text-white text-sm bg-slate-800/50 p-2 border-l-2 border-warning">${item.note.text}</p>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-textMuted font-mono">
                        <span class="text-white font-bold"><i class="fas fa-bolt"></i> ${item.fuse.id}</span>
                        <span>|</span>
                        <span>${p ? p.name : item.fuse.panel}</span>
                    </div>
                </div>
            `;
        });
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.classList.add('animate-fadeInUp');
}

window.closePendingNotesModal = function () {
    const modal = document.getElementById('pendingNotesModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.classList.remove('animate-fadeInUp');
    }
}


// --- TOPOLOGY ---
function renderTopology() {
    const container = document.getElementById('topology-container');
    if (!container) return;

    const rootPanel = STORE.panels.find(p => p.type === 'root');
    if (!rootPanel) return;

    let html = `<ul><li class="animate-fadeInUp" style="animation-delay: 0ms">${renderPanelNode(rootPanel)}`;

    const rootFuses = STORE.fuses.filter(f => f.panel === rootPanel.id && f.lifecycle === 'installed');
    if (rootFuses.length > 0) {
        html += `<ul>`;
        rootFuses.forEach((fuse, index) => {
            html += `<li class="animate-fadeInUp" style="animation-delay: ${index * 50 + 100}ms">${renderFuseNode(fuse)}</li>`;
        });
        html += `</ul>`;
    }

    const childrenPanels = STORE.panels.filter(p => p.parent === rootPanel.id);

    if (childrenPanels.length > 0) {
        html += `<ul>`;
        childrenPanels.forEach((panel, pIndex) => {
            html += `<li class="animate-fadeInUp" style="animation-delay: ${pIndex * 100 + 200}ms">${renderPanelNode(panel)}<ul>`;

            const panelFuses = STORE.fuses.filter(f => f.panel === panel.id && f.lifecycle === 'installed');
            panelFuses.forEach((fuse, fIndex) => {
                html += `<li class="animate-fadeInUp" style="animation-delay: ${(pIndex * 100) + (fIndex * 50) + 300}ms">${renderFuseNode(fuse)}</li>`;
            });

            if (panelFuses.length === 0) {
                html += `<li class="animate-fadeInUp" style="animation-delay: ${(pIndex * 100) + 300}ms"><span class="text-[10px] text-textMuted font-mono uppercase bg-bgCard border border-borderMain px-2 py-1">Sin Carga</span></li>`;
            }

            html += `</ul></li>`;
        });
        html += `</ul>`;
    }

    html += `</li></ul>`;
    container.innerHTML = html;
}

function renderPanelNode(panel) {
    const icon = panel.type === 'root' ? 'fa-industry' : 'fa-server';
    // Industrial Node Style
    return `
        <div class="tree-card rounded-sm min-w-[120px]">
            <div class="flex flex-col items-center">
                <i class="fas ${icon} mb-1 text-textMuted text-xs"></i>
                <span class="font-bold text-white uppercase text-[10px] tracking-wide">${panel.name}</span>
                ${panel.type !== 'root' ? `<span class="text-[9px] text-textMuted font-mono mt-1 border-t border-borderMain pt-0.5 w-full">${panel.id}</span>` : ''}
            </div>
        </div>
    `;
}

function getNHFuseIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block mb-1 text-textMuted">
        <path d="M7 4H17V20H7V4Z" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2V4" stroke="currentColor" stroke-width="2"/>
        <path d="M12 20V22" stroke="currentColor" stroke-width="2"/>
        <path d="M7 8H17" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
        <path d="M7 16H17" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
    </svg>`;
}

function renderFuseNode(fuse) {
    const statusClass = fuse.status === 'OK' ? 'status-ok' : fuse.status === 'WARN' ? 'status-warn' : 'status-danger';
    const statusText = fuse.status === 'OK' ? 'text-success' : fuse.status === 'WARN' ? 'text-warning' : 'text-danger';

    return `
        <div class="tree-card ${statusClass} rounded-sm" onclick="showFuseDetail('${fuse.id}')">
            <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1">
                 ${getNHFuseIcon()} <span class="font-mono text-white text-[10px] font-bold">${fuse.id}</span>
            </div>
            <div class="${statusText} text-[9px] font-bold uppercase tracking-wider">${fuse.status}</div>
             <div class="text-[9px] text-textMuted font-mono mt-0.5">${fuse.model}</div>
        </div>
        ${renderMachineryList(fuse)}
    `;
}

function renderMachineryList(fuse) {
    if (!fuse.machinery || fuse.machinery.length === 0) return '';
    let html = '<ul>';
    fuse.machinery.forEach(mach => {
        html += `
            <li>
                <div class="p-1 border border-borderMain bg-bgBody text-[9px] text-textMuted font-mono uppercase rounded-sm">
                    ${mach}
                </div>
            </li>
        `;
    });
    html += '</ul>';
    return html;
}

// --- ADD FUSE ---
function renderAddFusePanelOptions() {
    const select = document.getElementById('newFusePanel');
    if (!select) return;

    select.innerHTML = ''; // Clear existing options

    if (STORE.panels.length === 0) {
        const option = document.createElement('option');
        option.text = "No hay tableros disponibles";
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        return;
    }

    // Add default prompt
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "SELECCIONAR UBICACION...";
    select.appendChild(defaultOption);

    STORE.panels.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.id} - ${p.name}`;
        select.appendChild(option);
    });
}

window.addNewFuse = function () {
    const id = document.getElementById('newFuseId').value.trim();
    const type = document.getElementById('newFuseType').value;
    const amps = document.getElementById('newFuseAmps').value.trim();
    const panel = document.getElementById('newFusePanel').value;
    const machinesStr = document.getElementById('newFuseMachines').value.trim();

    if (!id || !type || !amps || !panel || !machinesStr) {
        showToast('DATOS INCOMPLETOS', 'error');
        return;
    }

    const model = `${type} ${amps}A`;

    if (STORE.fuses.some(f => f.id === id)) {
        showToast('ID DUPLICADO: ' + id, 'error');
        return;
    }

    const newFuse = {
        id: id,
        type: type.split(' ')[0], // NH-aM -> NH-aM
        curve: type.includes('aM') ? 'aM' : 'gG',
        amps: parseInt(amps),
        model: model,
        panel: panel,
        machinery: machinesStr.split(',').map(s => s.trim()),
        status: 'OK',
        lifecycle: 'installed',
        lastCheck: new Date().toISOString().split('T')[0],
        notes: [{ id: 1, text: 'Alta inicial del componente.', user: STORE.currentUser ? STORE.currentUser.initials : 'ADM', date: new Date().toLocaleString(), status: 'completed' }],
        condition: 'Operativo',
        maintReq: false,
        responsible: STORE.currentUser ? STORE.currentUser.initials : 'ADM'
    };

    STORE.fuses.push(newFuse);
    renderTopology();
    renderDashboard(); // Update counters immediately
    showToast('FUSIBLE REGISTRADO: ' + id, 'success');

    document.getElementById('newFuseId').value = '';
    document.getElementById('newFuseAmps').value = '';
    document.getElementById('newFuseMachines').value = '';

    logHistory(`Alta Sistema ${id}`, 'info', `Modelo: ${model}, Tablero: ${panel}`);
};

window.startAddFuseQRScan = function () {
    const overlay = document.getElementById('qrOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        setTimeout(() => {
            if (!overlay.classList.contains('hidden')) {
                closeQRScan();
                document.getElementById('newFuseId').value = 'SF-SCAN-99';
                document.getElementById('newFuseType').value = 'NH-aM';
                document.getElementById('newFuseAmps').value = '100';
                document.getElementById('newFuseMachines').value = 'Carga Detectada AUTO';
                showToast('SCAN COMPLETE', 'success');
            }
        }, 2000);
    }
}

// --- SEARCH & DETAILS ---
window.searchFuse = function () {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const query = input.value.trim().toUpperCase();
    const container = document.getElementById('searchResult');
    container.classList.remove('hidden');

    const fuse = STORE.fuses.find(f => f.id === query);

    if (fuse) {
        const p = STORE.panels.find(pl => pl.id === fuse.panel);
        const panelName = p ? p.name : (fuse.panel || 'EN ALMACÉN');
        const lifecycleBadge = fuse.lifecycle === 'warehouse' ?
            '<span class="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-[10px] uppercase border border-blue-700">EN ALMACÉN</span>' :
            fuse.lifecycle === 'retired' ?
                '<span class="bg-red-900 text-red-200 px-2 py-0.5 rounded text-[10px] uppercase border border-red-700">RETIRADO</span>' :
                '<span class="bg-green-900 text-green-200 px-2 py-0.5 rounded text-[10px] uppercase border border-green-700">INSTALADO</span>';

        // Annotations
        let notesHTML = '';
        if (fuse.notes && fuse.notes.length > 0) {
            fuse.notes.forEach(note => {
                const isPending = note.status === 'pending';
                const statusBadge = isPending ?
                    `<span class="ml-2 text-[9px] border border-warning text-warning px-1 cursor-pointer hover:bg-warning hover:text-black uppercase" onclick="toggleNoteStatus('${fuse.id}', ${note.id})">PENDIENTE</span>` :
                    `<span class="ml-2 text-[9px] border border-success text-success px-1 cursor-pointer hover:bg-success hover:text-black uppercase" onclick="toggleNoteStatus('${fuse.id}', ${note.id})">OK</span>`;

                notesHTML += `
                    <div class="mb-2 p-2 bg-bgBody border-l-2 border-borderMain">
                        <div class="flex justify-between mb-1">
                            <span class="text-[10px] font-bold text-accent font-mono">${note.user} / ${note.date}</span>
                            ${statusBadge}
                        </div>
                        <p class="text-xs text-textMain font-mono">${note.text}</p>
                    </div>
                `;
            });
        } else {
            notesHTML = '<p class="text-xs text-textMuted italic font-mono p-2">Sin registros.</p>';
        }

        container.innerHTML = `
            <div class="bg-bgCard border border-borderMain p-6 animate-fadeIn shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-6xl font-black text-white">ID</div>
                <div class="border-b border-borderMain pb-4 mb-6 flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-3">
                            ${getNHFuseIcon()} ${fuse.id}
                        </h2>
                        <div class="flex gap-4 mt-2 text-xs font-mono text-textMuted items-center">
                            <span>MODEL: <b class="text-white">${fuse.model}</b></span>
                            <span>PANEL: <b class="text-white">${panelName}</b></span>
                            ${lifecycleBadge}
                        </div>
                    </div>
                     <span class="px-4 py-1 text-xs font-bold font-mono uppercase ${fuse.status === 'OK' ? 'bg-success text-black' : fuse.status === 'WARN' ? 'bg-warning text-black' : 'bg-danger text-white'}">
                        STATUS: ${fuse.status}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-[10px] text-textMuted uppercase font-bold mb-1 font-mono">Maquinaria Asociada</label>
                            <input type="text" value="${fuse.machinery.join(', ')}" readonly class="w-full bg-slate-900 border border-borderMain p-2 text-white font-mono text-sm">
                        </div>
                        <div>
                            <label class="block text-[10px] text-textMuted uppercase font-bold mb-1 font-mono">Condición Operativa</label>
                            <select id="editCondition" class="w-full bg-slate-900 border border-borderMain p-2 text-white font-mono text-sm focus:border-accent">
                                <option value="Operativo" ${fuse.condition === 'Operativo' ? 'selected' : ''}>OPERATIVO</option>
                                <option value="En Observación" ${fuse.condition === 'En Observación' ? 'selected' : ''}>EN OBSERVACIÓN</option>
                                <option value="Reemplazo Próximo" ${fuse.condition === 'Reemplazo Próximo' ? 'selected' : ''}>REEMPLAZO PRÓXIMO</option>
                            </select>
                        </div>
                        <div class="flex items-center pt-4">
                            <input type="checkbox" id="editMaint" ${fuse.maintReq ? 'checked' : ''} class="w-4 h-4 bg-slate-900 border-borderMain text-accent focus:ring-0">
                            <span class="ml-2 text-xs text-white uppercase font-bold">Solicitar Mantenimiento</span>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                         <div>
                            <label class="block text-[10px] text-textMuted uppercase font-bold mb-1 font-mono">Última Revisión</label>
                            <input type="date" id="editDate" value="${fuse.lastCheck}" class="w-full bg-slate-900 border border-borderMain p-2 text-white font-mono text-sm">
                        </div>
                         <div>
                            <label class="block text-[10px] text-textMuted uppercase font-bold mb-1 font-mono">Responsable Técnico</label>
                            <input type="text" id="editResp" value="${fuse.responsible || ''}" class="w-full bg-slate-900 border border-borderMain p-2 text-white font-mono text-sm">
                        </div>
                    </div>
                </div>

                <div class="mb-4 bg-slate-900 border border-borderMain p-4 relative">
                    <label class="block text-[10px] text-accent uppercase font-bold mb-2 font-mono border-b border-white/10 pb-1">Bitácora de Eventos</label>
                    <div class="max-h-40 overflow-y-auto mb-3 custom-scrollbar">
                        ${notesHTML}
                    </div>
                    <div class="flex gap-0">
                        <input type="text" id="newNoteText" placeholder="Nueva entrada..." class="flex-1 bg-bgBody border border-borderMain p-2 text-white text-xs font-mono focus:outline-none focus:border-accent">
                        <button onclick="addFuseNote('${fuse.id}')" class="bg-borderMain hover:bg-white hover:text-black text-white px-3 text-xs uppercase"><i class="fas fa-plus"></i></button>
                    </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-borderMain">
                    <button onclick="saveFuseDetails('${fuse.id}')" class="bg-accent hover:bg-blue-600 text-white font-bold py-2 px-6 text-xs uppercase tracking-widest transition-transform active:scale-95 flex items-center gap-2">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="bg-bgCard border border-danger p-8 text-center animate-fadeIn">
                <h3 class="text-sm font-bold text-danger uppercase tracking-wider mb-2">Error de Búsqueda</h3>
                <p class="text-textMuted text-xs font-mono">ID "${query}" no encontrado en base de datos.</p>
            </div>
        `;
    }
};

window.addFuseNote = function (fuseId) {
    const input = document.getElementById('newNoteText');
    const text = input.value.trim();
    if (!text) return;

    const fuse = STORE.fuses.find(f => f.id === fuseId);
    if (fuse) {
        if (!fuse.notes) fuse.notes = [];
        fuse.notes.push({
            id: Date.now(),
            text: text,
            user: STORE.currentUser ? STORE.currentUser.initials : 'SYS',
            date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
            status: 'pending'
        });

        logHistory(`Nota Agregada: ${fuseId}`, 'info', `Texto: ${text.substring(0, 20)}...`);
        searchFuse();
    }
}

window.toggleNoteStatus = function (fuseId, noteId) {
    const fuse = STORE.fuses.find(f => f.id === fuseId);
    if (fuse && fuse.notes) {
        const note = fuse.notes.find(n => n.id === noteId);
        if (note) {
            note.status = note.status === 'pending' ? 'completed' : 'pending';
            searchFuse();
        }
    }
}

window.saveFuseDetails = function (id) {
    const fuse = STORE.fuses.find(f => f.id === id);
    if (!fuse) return;

    const oldCond = fuse.condition;
    fuse.condition = document.getElementById('editCondition').value;
    fuse.maintReq = document.getElementById('editMaint').checked;
    fuse.lastCheck = document.getElementById('editDate').value;
    fuse.responsible = document.getElementById('editResp').value;

    if (fuse.condition === 'Operativo' && !fuse.maintReq) {
        fuse.status = 'OK';
    } else if (fuse.condition === 'Reemplazo Próximo') {
        fuse.status = 'CRIT';
    } else {
        fuse.status = 'WARN';
    }

    renderTopology();
    showToast('FICHA ACTUALIZADA', 'success');

    let details = '';
    if (oldCond !== fuse.condition) details += `Cond: ${oldCond} -> ${fuse.condition}. `;
    if (fuse.maintReq) details += `Mantenimiento: SI.`;

    if (details) logHistory(`Update ${id}`, 'info', details);
};

window.showFuseDetail = function (id) {
    navigate('search');
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = id;
        searchFuse();
    }
}

// --- HISTORY LOGIC ---
function logHistory(action, type, details = '') {
    if (STORE.currentUser) {
        const newId = STORE.history.length > 0 ? STORE.history[0].id + 1 : 1;
        STORE.history.unshift({
            id: newId,
            date: 'AHORA',
            user: STORE.currentUser.initials,
            action: action,
            type: type,
            details: details
        });
        updateHistory();
    }
}

function updateHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;
    container.innerHTML = '';

    STORE.history.forEach((log, index) => {
        let icon = log.type === 'warn' ? 'fa-exclamation-triangle text-warning' :
            log.type === 'success' ? 'fa-check text-success' :
                'fa-info text-accent';

        // Technical Log Style
        container.innerHTML += `
            <div class="flex items-center gap-4 py-3 border-b border-borderMain hover:bg-white/5 cursor-pointer group transition-colors animate-fadeInUp" style="animation-delay: ${index * 50}ms" onclick="showHistoryDetail(${log.id})">
                <div class="w-12 text-center text-[10px] text-textMuted font-mono uppercase">${log.date}</div>
                <div class="w-6 text-center"><i class="fas ${icon} text-xs"></i></div>
                <div class="flex-1">
                    <div class="text-xs font-bold text-white uppercase font-mono group-hover:text-accent transition-colors">${log.action}</div>
                    <div class="text-[10px] text-textMuted font-mono truncate">${log.details.substring(0, 50)}</div>
                </div>
                <div class="w-12 text-center text-xs font-mono text-white bg-white/10 px-1 py-0.5">${log.user}</div>
            </div>
        `;
    });
}

window.showHistoryDetail = function (id) {
    const log = STORE.history.find(h => h.id === id);
    if (!log) return;

    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyModalContent');
    if (modal && content) {
        content.innerHTML = `
            <div class="border-b border-borderMain pb-3 mb-4 flex justify-between items-center">
                <h3 class="text-sm font-bold text-white uppercase font-mono tracking-wide">Evento #${log.id}</h3>
                <button onclick="closeHistoryModal()" class="text-textMuted hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
                <div><span class="text-textMuted block uppercase text-[10px]">Fecha</span> <span class="text-white">${log.date}</span></div>
                <div><span class="text-textMuted block uppercase text-[10px]">Usuario</span> <span class="text-white">${log.user}</span></div>
                <div><span class="text-textMuted block uppercase text-[10px]">Tipo</span> <span class="text-white uppercase">${log.type}</span></div>
            </div>
            
            <div class="bg-bgBody border border-borderMain p-4">
                 <span class="text-[10px] text-accent font-bold uppercase block mb-1">Detalle Técnico</span>
                 <p class="text-sm text-textMain font-mono">${log.details || 'N/A'}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-borderMain text-right">
                <button onclick="closeHistoryModal()" class="text-xs font-bold uppercase text-white bg-borderMain px-4 py-2 hover:bg-white hover:text-black">Cerrar</button>
            </div>
        `;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

window.closeHistoryModal = function () {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// --- REQUESTS ---
window.toggleRequestForm = () => {
    document.getElementById('requestForm').classList.toggle('hidden');
};

window.submitRequest = () => {
    const type = document.getElementById('reqType').value;
    const curve = document.getElementById('reqCurve').value;
    const amps = document.getElementById('reqAmps').value;
    const qty = document.getElementById('reqQty').value;
    const priority = document.getElementById('reqPriority').value;
    const dest = document.getElementById('reqDest').value;
    const reason = document.getElementById('reqReason').value;

    if (!dest || !reason) {
        showToast('DATOS INCOMPLETOS', 'error');
        return;
    }

    const itemStr = `${type} ${curve} ${amps}A`;
    const randId = Math.floor(Math.random() * 9000) + 1000;

    const newReq = {
        id: `REQ-${randId}`,
        date: new Date().toISOString().split('T')[0],
        item: itemStr,
        specs: { type, curve, amps },
        qty: parseInt(qty),
        priority: priority,
        status: 'Pendiente',
        dest: dest,
        reason: reason
    };

    STORE.requests.push(newReq);
    showToast('SOLICITUD ENVIADA', 'success');
    toggleRequestForm();
    renderRequests();

    // Reset Form
    document.getElementById('reqDest').value = '';
    document.getElementById('reqReason').value = '';

    logHistory(`Nueva Solicitud ${newReq.id}`, 'info', `${itemStr} x${qty}`);
    renderDashboard();
};

window.renderRequests = () => {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    STORE.requests.forEach((r, index) => {
        const isRecibido = r.status === 'Recibido';
        const actionBtn = isRecibido ?
            `<span class="text-xs text-textMuted italic"><i class="fas fa-check"></i> Completado</span>` :
            `<button onclick="receiveRequest('${r.id}')" class="bg-accent hover:bg-blue-600 text-white px-2 py-1 text-[10px] uppercase font-bold transition-colors shadow-sm">
                <i class="fas fa-download"></i> Recibir
            </button>`;

        const bgClass = r.status === 'Pendiente' ? 'bg-warning/10 text-warning' : r.status === 'Aprobado' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-success/10 text-success';

        tbody.innerHTML += `
            <tr class="hover:bg-white/5 transition-colors border-b border-borderMain animate-fadeInUp" style="animation-delay: ${index * 50}ms">
                <td class="p-3 font-mono text-white text-xs">${r.id}<br><span class="text-[10px] text-textMuted">${r.date}</span></td>
                <td class="p-3 font-mono text-white text-xs font-bold">${r.item}</td>
                <td class="p-3 font-mono text-white text-xs">${r.qty}</td>
                <td class="p-3 font-mono text-xs uppercase ${r.priority === 'alta' ? 'text-danger font-bold' : 'text-textMuted'}">${r.priority}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase border border-white/10 ${bgClass}">${r.status}</span>
                </td>
                <td class="p-3 text-right">
                    ${actionBtn}
                </td>
            </tr>
        `;
    });

    const countEl = document.getElementById('dash-req-count');
    if (countEl) countEl.innerText = STORE.requests.filter(r => r.status === 'Pendiente').length;
};

// [Old functions removed - See end of file for new implementation]

// --- STOCK MODULE ---
window.openIngestModal = () => {
    resetIngest();
    document.getElementById('ingestModal').classList.remove('hidden');
    document.getElementById('ingestModal').classList.add('flex');
};

window.closeIngestModal = () => {
    document.getElementById('ingestModal').classList.add('hidden');
    document.getElementById('ingestModal').classList.remove('flex');
};

window.resetIngest = () => {
    document.getElementById('ingestStep1').classList.remove('hidden');
    document.getElementById('ingestStep1').classList.add('flex');
    document.getElementById('ingestStep2').classList.add('hidden');
    document.getElementById('ingestStep2').classList.remove('block');

    // Clear fields
    document.getElementById('ingestId').value = '';
    document.getElementById('ingestType').value = '';
    document.getElementById('ingestCurve').value = '';
    document.getElementById('ingestAmps').value = '';
    document.getElementById('ingestModel').value = '';
};

window.startStockQRScan = () => {
    const btn = document.querySelector('#ingestStep1 button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> ESCANEANDO...';

    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        // Simulate Data
        const types = ['NH00', 'NH01', 'NH02'];
        const curves = ['gG', 'aM'];
        const ampsList = [32, 63, 80, 100, 125, 160, 250];

        const type = types[Math.floor(Math.random() * types.length)];
        const curve = curves[Math.floor(Math.random() * curves.length)];
        const amps = ampsList[Math.floor(Math.random() * ampsList.length)];
        const randId = Math.floor(Math.random() * 900000) + 100000;
        const id = `QR-${randId}`;
        const model = `${type} ${curve} ${amps}A`;

        // Fill Form
        document.getElementById('ingestId').value = id;
        document.getElementById('ingestType').value = type;
        document.getElementById('ingestCurve').value = curve;
        document.getElementById('ingestAmps').value = amps;
        document.getElementById('ingestModel').value = model;

        // Show Review
        document.getElementById('ingestStep1').classList.add('hidden');
        document.getElementById('ingestStep1').classList.remove('flex');
        document.getElementById('ingestStep2').classList.remove('hidden');
        document.getElementById('ingestStep2').classList.add('block');

        showToast('LECTURA QR EXITOSA', 'success');
    }, 1500);
};

window.confirmIngest = () => {
    const id = document.getElementById('ingestId').value;
    const type = document.getElementById('ingestType').value;
    const curve = document.getElementById('ingestCurve').value;
    const amps = document.getElementById('ingestAmps').value;
    const model = document.getElementById('ingestModel').value;

    if (!id) return;

    if (STORE.fuses.some(f => f.id === id)) {
        showToast('ERROR: ID YA EXISTE', 'error');
        return;
    }

    const newFuse = {
        id: id,
        type: type,
        curve: curve,
        amps: parseInt(amps),
        model: model,
        panel: null,
        machinery: [],
        status: 'OK',
        lifecycle: 'warehouse',
        lastCheck: new Date().toISOString().split('T')[0],
        notes: [{
            id: Date.now(),
            text: 'Ingreso individual por QR.',
            user: STORE.currentUser ? STORE.currentUser.initials : 'ADM',
            date: new Date().toLocaleString(),
            status: 'completed'
        }],
        condition: 'Nuevo',
        maintReq: false,
        responsible: null
    };

    STORE.fuses.push(newFuse);

    logHistory(`Ingreso QR ${id}`, 'info', `Modelo: ${model}`);
    showToast('FUSIBLE REGISTRADO', 'success');
    closeIngestModal();
    renderStock();
};

window.renderStock = () => {
    // 1. Overview Cards (Group by Type/Amps)
    const warehouseFuses = STORE.fuses.filter(f => f.lifecycle === 'warehouse');
    const overviewContainer = document.getElementById('stock-overview');
    const inventoryContainer = document.getElementById('stock-inventory-body');

    if (!overviewContainer || !inventoryContainer) return;

    // Grouping for Overview
    const groups = {};
    warehouseFuses.forEach(f => {
        const key = f.model;
        if (!groups[key]) groups[key] = 0;
        groups[key]++;
    });

    overviewContainer.innerHTML = '';
    Object.keys(groups).forEach((key, index) => {
        overviewContainer.innerHTML += `
            <div class="bg-bgCard border border-borderMain p-4 relative animate-fadeInUp" style="animation-delay: ${index * 50}ms">
                <div class="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Modelo</div>
                <div class="text-sm text-white font-mono font-bold truncate">${key}</div>
                <div class="absolute top-4 right-4 text-2xl font-mono text-accent">${groups[key]}</div>
                <div class="mt-2 h-1 w-full bg-slate-800">
                    <div class="h-full bg-accent" style="width: ${Math.min(groups[key] * 10, 100)}%"></div>
                </div>
            </div>
        `;
    });

    if (Object.keys(groups).length === 0) {
        overviewContainer.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center p-8 bg-bgCard border border-borderMain border-dashed">
                <i class="fas fa-box-open text-textMuted text-4xl mb-3"></i>
                <p class="text-xs text-textMuted italic max-w-xs text-center mb-4">No hay stock disponible. Se requiere reposición inmediata.</p>
                <button onclick="prefillRequest()" class="bg-warning text-black px-4 py-2 text-xs font-bold uppercase hover:bg-yellow-400 transition-colors">
                    Solicitar Reposición
                </button>
            </div>
        `;
    }

    // Inventory List
    inventoryContainer.innerHTML = '';
    warehouseFuses.forEach((f, index) => {
        inventoryContainer.innerHTML += `
            <tr class="hover:bg-white/5 transition-colors border-b border-borderMain animate-fadeInUp" style="animation-delay: ${index * 30}ms">
                <td class="p-3">
                    <div class="text-white font-bold font-mono text-xs"><i class="fas fa-qrcode text-textMuted mr-1"></i> ${f.id}</div>
                </td>
                <td class="p-3 text-white text-xs font-mono">${f.model}</td>
                <td class="p-3 text-textMuted text-[10px] font-mono">${f.lastCheck}</td>
                <td class="p-3 text-right">
                    <button onclick="openInstallModal('${f.id}')" class="bg-borderMain hover:bg-success hover:text-black text-white px-3 py-1 text-[10px] uppercase font-bold transition-all active:scale-95 transform">
                        Instalar
                    </button>
                </td>
            </tr>
        `;
    });
};

let fuseToInstallId = null;

window.openInstallModal = (fuseId) => {
    fuseToInstallId = fuseId;
    const fuse = STORE.fuses.find(f => f.id === fuseId);
    if (fuse) {
        document.getElementById('installFuseDisplay').textContent = `${fuse.id} - ${fuse.model}`;

        // Populate Panel Select
        const select = document.getElementById('installPanel');
        select.innerHTML = '<option value="">SELECCIONAR...</option>';
        STORE.panels.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.id} - ${p.name}`;
            select.appendChild(option);
        });

        document.getElementById('installMachine').value = '';
        document.getElementById('installModal').classList.remove('hidden');
        document.getElementById('installModal').classList.add('flex');
    }
};

window.closeInstallModal = () => {
    fuseToInstallId = null;
    document.getElementById('installModal').classList.add('hidden');
    document.getElementById('installModal').classList.remove('flex');
};

window.confirmInstall = () => {
    const panel = document.getElementById('installPanel').value;
    const machine = document.getElementById('installMachine').value.trim();

    if (!panel || !machine) {
        showToast('DATOS INCOMPLETOS', 'error');
        return;
    }

    const fuse = STORE.fuses.find(f => f.id === fuseToInstallId);
    if (fuse) {
        fuse.lifecycle = 'installed';
        fuse.panel = panel;
        fuse.machinery = [machine];
        fuse.condition = 'Operativo';
        fuse.responsible = STORE.currentUser ? STORE.currentUser.initials : 'ADM';

        fuse.notes.push({
            id: Date.now(),
            text: `Instalado en ${panel}. Carga: ${machine}`,
            user: STORE.currentUser ? STORE.currentUser.initials : 'ADM',
            date: new Date().toLocaleString(),
            status: 'completed'
        });

        logHistory(`Instalación ${fuse.id}`, 'success', `Destino: ${panel}`);
        showToast('COMPONENTE INSTALADO', 'success');

        closeInstallModal();
        renderStock();
        renderTopology(); // Update Diagram
        renderDashboard(); // Update Counts
    }
};

// --- QR ---
window.startQRScan = () => {
    const overlay = document.getElementById('qrOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        setTimeout(() => {
            if (!overlay.classList.contains('hidden')) {
                closeQRScan();
                showToast('CODE FOUND: SF-1002', 'success');
                showFuseDetail('SF-1002');
            }
        }, 3000);
    }
};

window.closeQRScan = () => {
    const overlay = document.getElementById('qrOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
};

// --- UTILS ---
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const icon = toast ? toast.querySelector('i') : null;

    if (toast && toastMsg) {
        toastMsg.textContent = msg;

        // Industrial Toast Styles
        if (type === 'error') {
            toast.style.borderLeftColor = '#ef4444';
            if (icon) { icon.className = 'fas fa-exclamation-triangle text-danger text-xl'; }
        } else if (type === 'success') {
            toast.style.borderLeftColor = '#10b981';
            if (icon) { icon.className = 'fas fa-check-square text-success text-xl'; }
        } else {
            toast.style.borderLeftColor = '#3b82f6';
            if (icon) { icon.className = 'fas fa-info-circle text-accent text-xl'; }
        }

        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

window.receiveRequest = (reqId) => {
    const req = STORE.requests.find(r => r.id === reqId);
    if (req) {
        req.status = 'Recibido';
        renderRequests();
        showToast('PEDIDO RECIBIDO', 'success');

        const stockLink = document.querySelector("a[onclick*='stock']");
        navigate('stock', stockLink);

        setTimeout(() => {
            resetIngest();
            document.getElementById('ingestModal').classList.remove('hidden');
            document.getElementById('ingestModal').classList.add('flex');

            document.getElementById('ingestStep1').classList.add('hidden');
            document.getElementById('ingestStep1').classList.remove('flex');
            document.getElementById('ingestStep2').classList.remove('hidden');
            document.getElementById('ingestStep2').classList.add('block');

            const randId = Math.floor(Math.random() * 900000) + 100000;
            const id = 'QR-' + randId;

            let type, curve, amps;

            if (req.specs) {
                type = req.specs.type;
                curve = req.specs.curve;
                amps = req.specs.amps;
            } else {
                const parts = req.item.split(' ');
                if (parts.length >= 3) {
                    type = parts[0];
                    curve = parts[1];
                    amps = parseInt(parts[2]);
                }
            }

            document.getElementById('ingestId').value = id;
            document.getElementById('ingestType').value = type;
            document.getElementById('ingestCurve').value = curve;
            document.getElementById('ingestAmps').value = amps;
            document.getElementById('ingestModel').value = type + ' ' + curve + ' ' + amps + 'A';

            showToast('DATOS DE PEDIDO CARGADOS', 'info');
        }, 500);
    }
};

window.prefillRequest = () => {
    const reqLink = document.querySelector("a[onclick*='requests']");
    navigate('requests', reqLink);
    const form = document.getElementById('requestForm');
    if (form.classList.contains('hidden')) form.classList.remove('hidden');
    document.getElementById('reqReason').value = 'Reposición por Stock Vacío';
    document.getElementById('reqPriority').value = 'Alta';
};

// --- FEEDBACK ---
function renderFeedback() {
    const user = STORE.currentUser;
    if (user) {
        document.getElementById('feedbackUser').value = user.name;
        document.getElementById('feedbackRole').value = user.role;
    }
    document.getElementById('feedbackDate').value = new Date().toLocaleString();
}

window.submitFeedback = function (e) {
    e.preventDefault();
    const text = document.getElementById('feedbackText').value.trim();

    if (!text) {
        showToast('Escriba un comentario', 'error');
        return;
    }

    // Simulate sending data
    showToast('Comentario Enviado', 'success');

    // Clear textarea but keep user info
    document.getElementById('feedbackText').value = '';

    logHistory('Feedback Enviado', 'info', 'Comentario al fabricante enviado.');
};

// --- MOBILE MENU LOGIC ---
window.toggleMobileMenu = function () {
    const overlay = document.getElementById('mobileMenuOverlay');
    const drawer = document.getElementById('mobileMenuDrawer');
    const fab = document.getElementById('mobileMenuFab');

    if (drawer && overlay && fab) {
        if (drawer.classList.contains('translate-y-full')) {
            // OPEN
            overlay.classList.remove('hidden');
            drawer.classList.remove('translate-y-full');
            fab.classList.add('scale-0');
        } else {
            // CLOSE
            overlay.classList.add('hidden');
            drawer.classList.add('translate-y-full');
            fab.classList.remove('scale-0');
        }
    }
};

window.navigateMobile = function (viewId, el) {
    // 1. Sync Desktop Sidebar (so if resized, it's correct)
    const desktopLink = document.querySelector(`aside a[onclick*="'${viewId}'"]`);
    if (desktopLink) {
        navigate(viewId, desktopLink);
    } else {
        navigate(viewId);
    }

    // 2. Mobile Visual Feedback
    document.querySelectorAll('.mobile-nav-link').forEach(n => {
        n.classList.remove('active');
        n.classList.add('text-textMuted');
    });

    if (el) {
        el.classList.remove('text-textMuted');
        el.classList.add('active');
    }

    // 3. Close Menu
    toggleMobileMenu();
};