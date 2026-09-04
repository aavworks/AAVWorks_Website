/**
 * AAV Works - Interactive Products & S&T Tools Showcase
 * Tab switching & live interactive console preview simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  initProductTabs();
  initConsoleSimulator();
});

function initProductTabs() {
  const tabs = document.querySelectorAll('.product-tab-btn');
  const panels = document.querySelectorAll('.product-panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target-panel');

      // Update active tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active panels
      panels.forEach(p => {
        if (p.id === targetId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  });
}

/**
 * Interactive Console Preview Simulator
 */
function initConsoleSimulator() {
  const runBtn = document.getElementById('runSimulatorBtn');
  const consoleOutput = document.getElementById('simulatorOutput');
  const statusBadge = document.getElementById('simulatorStatusBadge');

  if (!runBtn || !consoleOutput) return;

  let step = 0;
  const logs = [
    "[EI-KERNEL] Initializing Route Check... Point 101A (NORMAL), Signal S-12 (LOCKED)",
    "[A-FAT ENGINE] Testing Indian Railway Selection Table rules: 18/18 Zonal Constraints PASSED",
    "[SENSIO I/O] 448 Digital Input/Output Channels verified. Latency: 194ms (OK)",
    "[RAMS VALIDATOR] SIL-4 Safety Envelope Enforced. Track Circuit TC-4B CLEAR. Aspect -> GREEN"
  ];

  runBtn.addEventListener('click', () => {
    runBtn.disabled = true;
    runBtn.textContent = 'Simulating Interlocking Cycle...';
    if (statusBadge) {
      statusBadge.textContent = 'EXECUTING';
      statusBadge.style.backgroundColor = 'var(--color-amber)';
    }

    let i = 0;
    consoleOutput.innerHTML = '<div style="color: #64748B;">> Connecting to Virtual Electronic Interlocking Rack...</div>';

    const interval = setInterval(() => {
      if (i < logs.length) {
        const line = document.createElement('div');
        line.style.marginTop = '6px';
        line.style.color = i === logs.length - 1 ? '#10B981' : '#E2E8F0';
        line.textContent = `> ${logs[i]}`;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
        runBtn.disabled = false;
        runBtn.textContent = 'Run Interlocking Verification Test';
        if (statusBadge) {
          statusBadge.textContent = 'ONLINE / SIL-4';
          statusBadge.style.backgroundColor = 'var(--color-emerald)';
        }
      }
    }, 450);
  });
}
