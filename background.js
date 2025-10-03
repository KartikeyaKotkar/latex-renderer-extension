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

browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({
        enabled: true,
        filterMode: 'blacklist',
        sites: ''
    });
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'settingsChanged') {
        return browser.tabs.query({}).then(tabs => {
            return Promise.all(tabs.map(tab => {
                const shouldEnable = shouldEnableForUrl(tab.url, message.settings);
                return browser.tabs.sendMessage(tab.id, {
                    type: 'settingsUpdated',
                    enabled: shouldEnable
                }).catch(() => {
                });
            }));
        });
    }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo && changeInfo.url) {
        return browser.storage.local.get({
            enabled: true,
            filterMode: 'blacklist',
            sites: ''
        }).then(settings => {
            return browser.tabs.sendMessage(tabId, {
                type: 'settingsUpdated',
                enabled: shouldEnableForUrl(changeInfo.url, settings)
            }).catch(() => {
            });
        }).catch(err => console.error('Error getting settings on tab update:', err));
    }
});