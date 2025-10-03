let isEnabled = true;

browser.storage.local.get({ enabled: true, filterMode: 'blacklist', sites: '' })
    .then(settings => {
        const url = window.location.href;
        isEnabled = shouldEnableForUrl(url, settings);
        if (isEnabled) {
            renderLatexInElement(document.body);
            startObserver();
        }
    })
    .catch(err => console.error('Error reading settings in content script:', err));

function shouldEnableForUrl(url, settings) {
    if (!settings.enabled) return false;

    try {
        const hostname = new URL(url).hostname;
        const sitesList = settings.sites.split('\n')
            .map(site => site.trim())
            .filter(site => site.length > 0);

        if (sitesList.length === 0) {
            return settings.filterMode === 'blacklist';
        }

        const isListed = sitesList.some(site => 
            hostname === site || hostname.endsWith('.' + site));

        return settings.filterMode === 'whitelist' ? isListed : !isListed;
    } catch (e) {
        console.error('Error processing URL:', e);
        return false;
    }
}

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'settingsUpdated') {
        isEnabled = message.enabled;
        if (isEnabled) {
            renderLatexInElement(document.body);
            startObserver();
        } else {
            undoRenderedLatex();
            stopObserver();
        }
    }
});

function renderLatexInElement(element) {
    // Skip rendering if extension is disabled for this site
    if (!isEnabled) return;

    // We use a TreeWalker to efficiently find all text nodes.
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    
    let nodes = [];
    let currentNode = walker.nextNode();
    while(currentNode) {
        nodes.push(currentNode);
        currentNode = walker.nextNode();
    }

    // Regular expression to find LaTeX, both inline and display.
    // It looks for $...$ or $$...$$
    // Note: This is a simplified regex and might not handle all edge cases like escaped \$
    const latexRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;

    for (const node of nodes) {
        if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) {
            continue;
        }

        const text = node.textContent;
        const matches = text.match(latexRegex);

        if (matches) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            for (const match of matches) {
                const matchIndex = text.indexOf(match, lastIndex);
                
                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
                }

                const isDisplayMode = match.startsWith('$$');
                const latex = match.slice(isDisplayMode ? 2 : 1, isDisplayMode ? -2 : -1);

                try {
                    const span = document.createElement('span');
                    span.setAttribute('data-latex-rendered', 'true');
                    span.setAttribute('data-latex-original', match);
                    span.setAttribute('data-latex-display', isDisplayMode ? '1' : '0');
                    katex.render(latex, span, {
                        throwOnError: false,
                        displayMode: isDisplayMode
                    });
                    fragment.appendChild(span);
                } catch (e) {
                    console.error("KaTeX rendering error:", e);
                    // If rendering fails, just append the original text
                    fragment.appendChild(document.createTextNode(match));
                }
                
                lastIndex = matchIndex + match.length;
            }

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }

            node.parentNode.replaceChild(fragment, node);
        }
    }
}


let observer = null;
function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    renderLatexInElement(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
}

function undoRenderedLatex() {
    // Find all elements that were created by our renderer
    const rendered = document.querySelectorAll('[data-latex-rendered]');
    rendered.forEach(el => {
        const original = el.getAttribute('data-latex-original');
        const toInsert = (typeof original === 'string') ? original : (el.textContent || '');
        const textNode = document.createTextNode(toInsert);
        el.parentNode.replaceChild(textNode, el);
    });
}