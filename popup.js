document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleWrap')
  const sitesEl = document.getElementById('sitesList')
  const modeWhitelist = document.getElementById('modeWhitelist')
  const modeBlacklist = document.getElementById('modeBlacklist')
  const statusPill = document.getElementById('statusPill')

  function readSettings(){
    return browser.storage.local.get({enabled:true,filterMode:'blacklist',sites:''})
  }

  function saveAndBroadcast(settings){
    return browser.storage.local.set(settings).then(() => {
      return browser.runtime.sendMessage({type:'settingsChanged',settings})
    })
  }

  function applySettingsToUI(settings){
    if(settings.enabled){
      toggle.classList.add('on')
      toggle.setAttribute('aria-checked','true')
      statusPill.classList.add('on')
      statusPill.textContent = 'Enabled'
    } else {
      toggle.classList.remove('on')
      toggle.setAttribute('aria-checked','false')
      statusPill.classList.remove('on')
      statusPill.textContent = 'Disabled'
    }

    if(settings.filterMode === 'whitelist'){
      modeWhitelist.classList.add('active')
      modeBlacklist.classList.remove('active')
    } else {
      modeWhitelist.classList.remove('active')
      modeBlacklist.classList.add('active')
    }

    sitesEl.value = settings.sites || ''
  }

  toggle.addEventListener('click', async ()=>{
    const s = await readSettings()
    s.enabled = !s.enabled
    applySettingsToUI(s)
    saveAndBroadcast(s)
  })

  modeWhitelist.addEventListener('click', async ()=>{
    const s = await readSettings()
    s.filterMode = 'whitelist'
    applySettingsToUI(s)
    saveAndBroadcast(s)
  })

  modeBlacklist.addEventListener('click', async ()=>{
    const s = await readSettings()
    s.filterMode = 'blacklist'
    applySettingsToUI(s)
    saveAndBroadcast(s)
  })

  let saveTimer = null
  sitesEl.addEventListener('input', ()=>{
    if(saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async ()=>{
      const s = await readSettings()
      s.sites = sitesEl.value
      saveAndBroadcast(s)
    },350)
  })

  // initial load
  readSettings().then(applySettingsToUI).catch(console.error)
})