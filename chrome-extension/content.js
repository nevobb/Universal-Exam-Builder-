/**
 * Gemini to TestBuilder Bridge - Content Script (v2.4.0-DEBUG)
 * Handles UI Injection (Buttons & Toast) and event bridging.
 * Pure DOM implementation to bypass TrustedHTML restrictions.
 */

(function() {
    console.log("🚀 TestBuilder Extension v2.4.0-DEBUG Active");
    // NOTE: TrustedTypes violation monitoring runs in interceptor.js (MAIN world).
    // This ISOLATED world context has its own JS realm — a defaultPolicy set here
    // cannot intercept violations from Gemini's page code. No policy needed here.
    const bridgeEventName = '__GEMINI_DATA_DETECTED__';
    const btnClass = 'testbuilder-bridge-btn-v2';
    const toastId = 'testbuilder-magic-toast';
    let lastDetectedData = null;

    // 1. OBSERVE FOR CODE BLOCKS
    const observer = new MutationObserver(() => {
        injectButtons();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function injectButtons() {
        // Find Gemini code block headers (they contain the "Copy" button)
        const codeBlockHeaders = document.querySelectorAll('.buttons'); // Base on established selector from audit
        
        codeBlockHeaders.forEach(header => {
            if (header.querySelector(`.${btnClass}`)) return;

            // Create button using safe DOM methods
            const btn = document.createElement('button');
            btn.className = btnClass;
            
            // Apply styles manually (safe)
            Object.assign(btn.style, {
                backgroundColor: 'transparent',
                color: 'var(--gem-sys-color-primary, #1a73e8)',
                border: '1px solid var(--gem-sys-color-outline, #dadce0)',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginLeft: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
            });

            const emoji = document.createElement('span');
            emoji.style.fontSize = '14px';
            emoji.style.marginRight = '4px';
            emoji.textContent = '🚀';

            const text = document.createTextNode('Send to TestBuilder');
            
            btn.appendChild(emoji);
            btn.appendChild(text);

            // Click handler
            btn.onclick = (e) => {
                e.stopPropagation();
                // Find JSON in the adjacent code block
                const codeBlock = header.closest('code-block') || header.parentElement.parentElement;
                const codeText = codeBlock ? codeBlock.textContent : '';
                
                try {
                    // Try to extract JSON from the text
                    const data = extractJson(codeText);
                    if (data) {
                        sendToApp(data);
                        btn.style.borderColor = '#34a853';
                        btn.style.color = '#34a853';
                        btn.textContent = '✅ Sent!';
                        setTimeout(() => {
                            btn.textContent = 'Send to TestBuilder';
                            btn.style.color = 'var(--gem-sys-color-primary, #1a73e8)';
                            btn.style.borderColor = 'var(--gem-sys-color-outline, #dadce0)';
                            btn.prepend(emoji);
                        }, 2000);
                    } else {
                        alert('No valid TestBuilder JSON found in this block.');
                    }
                } catch (err) {
                    console.error('[Bridge] Click Error:', err);
                }
            };

            // Insert before the first existing button (usually the copy button)
            if (header.firstChild) {
                header.insertBefore(btn, header.firstChild);
            } else {
                header.appendChild(btn);
            }
        });
    }

    function extractJson(text) {
        // Clean markdown backticks
        const clean = text.replace(/```(json)?/g, '').trim();
        try {
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            // Regex fallback for partial/messy blocks
            const match = text.match(/\[\s*\{.*\}\s*\]/gs);
            if (match) {
                try { return JSON.parse(match[0]); } catch (e2) {}
            }
        }
        return null;
    }

    function sendToApp(data) {
        window.postMessage({ type: 'GEMINI_EXAM_INJECT', payload: data }, "*");
        console.log('[Bridge] Data sent to app:', data);
    }

    // 2. LISTEN FOR INTERCEPTOR (TOAST MODE)
    window.addEventListener(bridgeEventName, (e) => {
        if (e.detail) {
            lastDetectedData = e.detail;
            createToast();
            showToast();
        }
    });

    function createToast() {
        if (document.getElementById(toastId)) return;
        const toast = document.createElement('div');
        toast.id = toastId;
        Object.assign(toast.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            backgroundColor: 'rgba(25, 25, 25, 0.95)', color: 'white',
            padding: '16px 24px', borderRadius: '16px', zIndex: '99999',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', cursor: 'pointer',
            fontFamily: '"Google Sans", sans-serif', display: 'flex', gap: '12px',
            transition: 'all 0.5s', transform: 'translateY(150%)', opacity: '0'
        });
        toast.textContent = '🚀 New Exam Detected - Click to Load';
        toast.onclick = () => {
             if (lastDetectedData) {
                 sendToApp(lastDetectedData);
                 toast.textContent = '✅ Loaded!';
                 setTimeout(hideToast, 2000);
             }
        };
        document.body.appendChild(toast);
    }

    function showToast() {
        const t = document.getElementById(toastId);
        if (t) { t.style.transform = 'translateY(0)'; t.style.opacity = '1'; }
    }

    function hideToast() {
        const t = document.getElementById(toastId);
        if (t) { t.style.transform = 'translateY(150%)'; t.style.opacity = '0'; }
    }

    injectButtons();
})();
