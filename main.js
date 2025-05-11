require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs" } })

let editor
let isAttached = false
let scriptContent = ""
let fontSize = 14
let monaco

require(["vs/editor/editor.main"], (monacoInstance) => {
  monaco = monacoInstance

  monaco.editor.defineTheme("novaCustom", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1e1e2e",
      "editorGutter.background": "#1e1e2e",
      "editor.lineHighlightBackground": "#2d2d3f",
      "editorLineNumber.foreground": "#7c3aed80",
      "editorLineNumber.activeForeground": "#7c3aed",
    },
  })

  editor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: '-- NovaUI Executor\n-- Enter your script here\n\nprint("Hello, World!")',
    language: "lua",
    theme: "novaCustom",
    automaticLayout: true,
    minimap: {
      enabled: true,
      scale: 0.8,
      showSlider: "mouseover",
    },
    fontSize: fontSize,
    fontFamily: 'Consolas, "Fira Code", monospace',
    scrollBeyondLastLine: false,
    padding: {
      top: 20,
      bottom: 20,
    },
    lineHeight: 1.5,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    renderLineHighlight: "all",
    renderWhitespace: "none",
    renderIndentGuides: true,
    colorDecorators: true,
    contextmenu: true,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    fixedOverflowWidgets: true,
  })

  const wordWrapToggle = document.getElementById("word-wrap-toggle")
  editor.updateOptions({ wordWrap: wordWrapToggle.checked ? "on" : "off" })

  const tabSizeSelect = document.getElementById("tab-size")
  editor.updateOptions({ tabSize: Number.parseInt(tabSizeSelect.value) })

  document.querySelector(".color-option").classList.add("active")
})

const navItems = document.querySelectorAll(".nav-item")
const tabContents = document.querySelectorAll(".tab-content")

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const tabName = item.getAttribute("data-tab")

    navItems.forEach((navItem) => navItem.classList.remove("active"))
    tabContents.forEach((tab) => tab.classList.remove("active"))

    item.classList.add("active")
    document.getElementById(`${tabName}-tab`).classList.add("active")

    document.getElementById(`${tabName}-tab`).style.animation = "fadeIn 0.5s ease"
  })
})

const themeToggle = document.getElementById("theme-toggle")
const lightThemeOption = document.querySelector(".theme-option.light")
const darkThemeOption = document.querySelector(".theme-option.dark")

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.remove("light-theme")
    document.body.classList.add("dark-theme")
    lightThemeOption.classList.remove("active")
    darkThemeOption.classList.add("active")
    if (editor) {
      monaco.editor.setTheme("novaCustom")
    }
  } else {
    document.body.classList.remove("dark-theme")
    document.body.classList.add("light-theme")
    darkThemeOption.classList.remove("active")
    lightThemeOption.classList.add("active")
    if (editor) {
      monaco.editor.setTheme("vs")
    }
  }
})

const decreaseFontBtn = document.getElementById("decrease-font")
const increaseFontBtn = document.getElementById("increase-font")
const fontSizeValue = document.getElementById("font-size-value")

decreaseFontBtn.addEventListener("click", () => {
  if (fontSize > 8) {
    fontSize -= 2
    fontSizeValue.textContent = `${fontSize}px`
    if (editor) {
      editor.updateOptions({ fontSize: fontSize })
    }
  }
})

increaseFontBtn.addEventListener("click", () => {
  if (fontSize < 24) {
    fontSize += 2
    fontSizeValue.textContent = `${fontSize}px`
    if (editor) {
      editor.updateOptions({ fontSize: fontSize })
    }
  }
})

const colorOptions = document.querySelectorAll(".color-option")

colorOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const color = option.getAttribute("data-color")
    document.documentElement.style.setProperty("--primary-color", color)

    colorOptions.forEach((opt) => opt.classList.remove("active"))
    option.classList.add("active")
  })
})

const wordWrapToggle = document.getElementById("word-wrap-toggle")

wordWrapToggle.addEventListener("change", () => {
  if (editor) {
    editor.updateOptions({ wordWrap: wordWrapToggle.checked ? "on" : "off" })
  }
})

const tabSizeSelect = document.getElementById("tab-size")

tabSizeSelect.addEventListener("change", () => {
  if (editor) {
    editor.updateOptions({ tabSize: Number.parseInt(tabSizeSelect.value) })
  }
})

const clearBtn = document.getElementById("clear-btn")

clearBtn.addEventListener("click", () => {
  if (editor) {
    editor.setValue("-- NovaUI Executor\n-- Enter your script here\n\n")
    showNotification("Editor cleared", "info")
  }
})

const attachBtn = document.getElementById("attach-btn")

attachBtn.addEventListener("click", async () => {
  try {
    attachBtn.disabled = true
    attachBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Attaching...</span>'

    const START_PORT = 6969
    const END_PORT = 7069
    let serverPort = null
    let lastError = ""

    try {
      for (let port = START_PORT; port <= END_PORT; port++) {
        const url = `http://127.0.0.1:${port}/secret`

        try {
          const res = await fetch(url, {
            method: "GET",
          })
          if (res.ok) {
            const text = await res.text()
            if (text === "0xdeadbeef") {
              serverPort = port
              console.log(`✅ Server found on port ${port}`)
              break
            }
          }
        } catch (e) {
          lastError = e.message
        }
      }

      if (!serverPort) {
        throw new Error(`Could not locate HTTP server on ports ${START_PORT}-${END_PORT}. Last error: ${lastError}`)
      }

      isAttached = true
      showNotification("Successfully attached to Roblox!", "success")
    } catch (error) {
      console.error("Attachment error:", error)
      showNotification("Failed to attach: " + error.message, "error")
    }

    setTimeout(() => {
      attachBtn.disabled = false
      if (isAttached) {
        attachBtn.innerHTML = '<i class="fas fa-check"></i><span>Attached</span>'
        attachBtn.classList.add("attached")
      } else {
        attachBtn.innerHTML = '<i class="fas fa-link"></i><span>Attach</span>'
      }
    }, 1500)
  } catch (error) {
    console.error("Error:", error)
    showNotification("An error occurred: " + error.message, "error")
    attachBtn.disabled = false
    attachBtn.innerHTML = '<i class="fas fa-link"></i><span>Attach</span>'
  }
})

const executeBtn = document.getElementById("execute-btn")

executeBtn.addEventListener("click", async () => {
  if (!isAttached) {
    showNotification("Please attach to Roblox first!", "warning")
    return
  }

  try {
    executeBtn.disabled = true
    executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Executing...</span>'

    scriptContent = editor.getValue()

    const START_PORT = 6969
    const END_PORT = 7069
    let serverPort = null
    let lastError = ""

    try {
      for (let port = START_PORT; port <= END_PORT; port++) {
        const url = `http://127.0.0.1:${port}/secret`

        try {
          const res = await fetch(url, {
            method: "GET"
          })
          if (res.ok) {
            const text = await res.text()
            if (text === "0xdeadbeef") {
              serverPort = port
              console.log(`✅ Server found on port ${port}`)
              break
            }
          }
        } catch (e) {
          lastError = e.message
        }
      }

      if (!serverPort) {
        throw new Error(`Could not locate HTTP server on ports ${START_PORT}-${END_PORT}. Last error: ${lastError}`)
      }

      const postUrl = `http://127.0.0.1:${serverPort}/execute`
      console.log(`Sending script to ${postUrl}`)

      const response = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: scriptContent
      })

      if (response.ok) {
        const resultText = await response.text()
        console.log(`✅ Script submitted successfully: ${resultText}`)
        showNotification(`Script sent to server successfully.`, "success")
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error("Execution error:", error)
      showNotification("Failed to execute: " + error.message, "error")
    }

    setTimeout(() => {
      executeBtn.disabled = false
      executeBtn.innerHTML = '<i class="fas fa-play"></i><span>Execute</span>'
    }, 1000)
  } catch (error) {
    console.error("Error:", error)
    showNotification("An error occurred: " + error.message, "error")
    executeBtn.disabled = false
    executeBtn.innerHTML = '<i class="fas fa-play"></i><span>Execute</span>'
  }
})

const proxAPI = "https://scriptblox-api-proxy.vercel.app/api/fetch"
const searchproxAPI = "https://scriptblox-api-proxy.vercel.app/api/search"
const S_Cache = new Map()
let currentPage = 1
let isModes = false
let Querys = ""
let Modes = ""
let isSearching = false
let scriptsData = []

const scriptsGrid = document.getElementById("scripts-grid")
const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")
const prevButton = document.getElementById("prev-button")
const nextButton = document.getElementById("next-button")
const reloadButton = document.getElementById("reload-button")
const scriptDetailsModal = document.getElementById("script-details-modal")
const modalTitle = document.getElementById("modal-title")
const modalDetails = document.getElementById("modal-details")
const closeModal = document.getElementById("close-modal")

async function initScriptHub() {
  try {
    scriptsGrid.innerHTML = '<div style="text-align: center; width: 100%; padding: 20px;">Loading scripts...</div>'

    await fetchScripts()
    setupScriptHubEvents()

    scriptsGrid.style.display = "none"
    setTimeout(() => {
      scriptsGrid.style.display = "grid"
    }, 10)
  } catch (error) {
    console.error("Error initializing script hub:", error)
    scriptsGrid.innerHTML = `<div style="text-align: center; width: 100%; padding: 20px;">Failed to connect to Script Hub API</div>`
  }
}

async function fetchScripts(page = 1) {
  setSearchingState(true)

  if (S_Cache.has(page)) {
    scriptsData = S_Cache.get(page)
    displayScripts(scriptsData)
    setSearchingState(false)
    return
  }

  const controller = new AbortController()
  const signal = controller.signal

  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${proxAPI}?page=${page}`, { signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests at the same time")
      }
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.result || !data.result.scripts.length) throw new Error("No scripts found.")

    scriptsData = data.result.scripts.map((script) => ({
      _id: script._id,
      title: script.title,
      views: script.views || Math.floor(Math.random() * 1000),
      key: script.key,
      game: {
        name: script.game?.name || "Universal",
        imageUrl: script.game?.imageUrl || null,
      },
      script: script.script,
      slug: script.slug,
      verified: script.verified,
      isPatched: script.isPatched,
      scriptType: script.scriptType,
      createdAt: script.createdAt,
      updatedAt: script.updatedAt,
      keyLink: script.keyLink,
    }))

    S_Cache.set(page, scriptsData)

    displayScripts(scriptsData)
  } catch (error) {
    if (error.name === "AbortError") {
      scriptsGrid.innerHTML = `<div style="text-align: center; width: 100%; padding: 20px;">Request timed out. Please try again.</div>`
    } else {
      scriptsGrid.innerHTML = `<div style="text-align: center; width: 100%; padding: 20px;">${error.message}</div>`
    }
  } finally {
    setSearchingState(false)
  }
}

async function searchScripts(query, mode, page = 1) {
  setSearchingState(true)

  const controller = new AbortController()
  const signal = controller.signal

  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const url = new URL(searchproxAPI)
    url.searchParams.append("q", query)
    if (mode) url.searchParams.append("mode", mode)
    url.searchParams.append("page", page)

    const response = await fetch(url, { signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("")
      }
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.result || !data.result.scripts.length) throw new Error("No results found")

    scriptsData = data.result.scripts.map((script) => ({
      _id: script._id,
      title: script.title,
      views: script.views || Math.floor(Math.random() * 1000),
      key: script.key,
      game: {
        name: script.game?.name || "Universal",
        imageUrl: script.game?.imageUrl || null,
      },
      script: script.script,
      slug: script.slug,
      verified: script.verified,
      isPatched: script.isPatched,
      scriptType: script.scriptType,
      createdAt: script.createdAt,
      updatedAt: script.updatedAt,
      keyLink: script.keyLink,
    }))

    displayScripts(scriptsData)
  } catch (error) {
    if (error.name === "AbortError") {
      scriptsGrid.innerHTML = `<div style="text-align: center; width: 100%; padding: 20px;">Request timed out. Please try again.</div>`
    } else {
      scriptsGrid.innerHTML = `<div style="text-align: center; width: 100%; padding: 20px;">${error.message}</div>`
    }
  } finally {
    setSearchingState(false)
  }
}

function setSearchingState(searching) {
  isSearching = searching

  const searchIcon = searchButton.querySelector("i")
  if (searching) {
    if (searchIcon) {
      searchIcon.className = "fas fa-spinner fa-spin"
    }
  } else {
    if (searchIcon) {
      searchIcon.className = "fas fa-search"
    }
  }

  searchButton.disabled = searching
  reloadButton.disabled = searching
}

function displayScripts(scripts) {
  scriptsGrid.innerHTML = ""
  const maxTitleLength = 15

  const fragment = document.createDocumentFragment()

  scripts.forEach((script, index) => {
    let displayTitle = script.title
    if (displayTitle.length > maxTitleLength) {
      displayTitle = displayTitle.substring(0, maxTitleLength) + "..."
    }

    let imageSrc
    if (script.game?.imageUrl && script.game.imageUrl.startsWith("http")) {
      imageSrc = script.game.imageUrl
    } else if (script.game?.imageUrl) {
      imageSrc = `https://scriptblox.com${script.game.imageUrl}`
    } else {
      imageSrc =
        "https://cdn.discordapp.com/attachments/1309919315755012171/1364661809205874818/Screenshot_2025-04-23_at_19.58.33.png?ex=680a7bd9&is=68092a59&hm=4ff6854090c738082972754eacdc2cf14fffde9ab30369ad82de263b1ce3b9f6&"
    }

    let gameName = script.game?.name || "Universal"
    if (gameName.length > 50) {
      gameName = gameName.substring(0, 15) + "..."
    }

    const scriptCard = document.createElement("div")
    scriptCard.className = "script-card"
    scriptCard.style.animationDelay = `${index * 0.05}s`
    scriptCard.dataset.id = script._id

    scriptCard.innerHTML = `
      <div class="card-image-container">
        <img src="${imageSrc}" alt="${displayTitle}" loading="lazy">
        <div class="card-header">
          <div class="card-views">
            <i class="fas fa-eye"></i>
            <span>${script.views}</span>
          </div>
          <div class="card-tag ${script.key ? "key" : ""}">
            ${script.key ? "Key" : "Free"}
          </div>
        </div>
      </div>
      <div class="card-content">
        <div>
          <h2 class="card-title">${displayTitle}</h2>
          <p class="card-game">${gameName}</p>
        </div>
        <div class="card-buttons">
          <button class="card-button copy" data-id="${script._id}">
            <i class="fas fa-copy"></i> Copy Script
          </button>
          <button class="card-button execute" data-id="${script._id}">
            <i class="fas fa-play"></i> Execute
          </button>
        </div>
      </div>
    `

    fragment.appendChild(scriptCard)
  })

  scriptsGrid.appendChild(fragment)
  updatePaginationButtons()
}

function updatePaginationButtons() {
  prevButton.disabled = currentPage === 1
  prevButton.style.opacity = prevButton.disabled ? "0.5" : "1"
  prevButton.style.backgroundColor = prevButton.disabled ? "#333" : "#7c3aed"
}

function displayScriptDetails(script) {
  const gameName = script.game?.name || "Universal"
  const gameImage = script.game?.imageUrl
    ? script.game.imageUrl.startsWith("http")
      ? script.game.imageUrl
      : `https://scriptblox.com${script.game.imageUrl}`
    : "https://cdn.discordapp.com/attachments/1309919315755012171/1364661809205874818/Screenshot_2025-04-23_at_19.58.33.png?ex=680a7bd9&is=68092a59&hm=4ff6854090c738082972754eacdc2cf14fffde9ab30369ad82de263b1ce3b9f6&"

  if (!script.script) {
    window.open(`https://scriptblox.com/script/${script.slug}`, "_blank")
    return
  }

  const maxModalTitleLength = 20
  const modalDisplayTitle =
    script.title.length > maxModalTitleLength ? script.title.substring(0, maxModalTitleLength) + "..." : script.title

  modalTitle.textContent = "Script Details"

  modalDetails.innerHTML = `
    <div class="minimal-details-card">
      <div class="details-header">
        <div class="header-image">
          <img src="${gameImage}" alt="${gameName}" onerror="this.src='404.jpg';">
        </div>
        <div class="header-info">
          <h3>${modalDisplayTitle}</h3>
          <div class="details-tags">
            <span class="tag ${script.verified ? "verified" : "not-verified"}">
              <i class="fas fa-${script.verified ? "check-circle" : "times-circle"}"></i>
              ${script.verified ? "Verified" : "Not Verified"}
            </span>
            <span class="tag ${script.isPatched ? "patched" : "active"}">
              <i class="fas fa-${script.isPatched ? "ban" : "check"}"></i>
              ${script.isPatched ? "Patched" : "Active"}
            </span>
            <span class="tag ${script.scriptType === "paid" ? "paid" : ""}">
              <i class="fas fa-${script.scriptType === "paid" ? "dollar-sign" : "code"}"></i>
              ${script.scriptType.charAt(0).toUpperCase() + script.scriptType.slice(1)}
            </span>
            ${
              script.key
                ? `
                <span class="tag key">
                  <i class="fas fa-key"></i>
                  Requires Key
                </span>
              `
                : ""
            }
          </div>
        </div>
      </div>
      
      <div class="details-section">
        <h4><i class="fas fa-info-circle"></i> Details</h4>
        <div class="details-info">
          <div class="info-item">
            <i class="fas fa-eye"></i>
            <span>${script.views.toLocaleString()} Views</span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Created: ${new Date(script.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar-check"></i>
            <span>Updated: ${new Date(script.updatedAt).toLocaleDateString()}</span>
          </div>
          ${
            script.key
              ? `
              <div class="info-item">
                <i class="fas fa-key"></i>
                <a href="${script.keyLink}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: underline;">Get Key</a>
              </div>
            `
              : ""
          }
        </div>
      </div>

      <div class="script-box">
        <h4><i class="fas fa-code"></i> Script</h4>
        <div class="code-container">
          <pre>${script.script || "No script available."}</pre>
          <button class="copy-button">
            <i class="fas fa-copy"></i>
            Copy Script
          </button>
        </div>
      </div>
    </div>
  `

  const copyButton = modalDetails.querySelector(".copy-button")
  copyButton.addEventListener("click", async () => {
    const icon = copyButton.querySelector("i")
    const originalClass = icon.className
    const originalText = copyButton.textContent

    icon.className = "fas fa-spinner fa-spin"
    copyButton.textContent = " Copying..."
    copyButton.prepend(icon)
    copyButton.disabled = true

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(script.script || "No script available.")
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = script.script || "No script available."
        textArea.style.position = "fixed"
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        document.body.removeChild(textArea)
      }

      icon.className = "fas fa-check"
      copyButton.textContent = " Copied!"
      copyButton.prepend(icon)
    } catch (err) {
      console.error("Impossible to copy the text: ", err)

      icon.className = originalClass
      copyButton.textContent = originalText
      copyButton.prepend(icon)
    } finally {
      setTimeout(() => {
        copyButton.disabled = false
        icon.className = originalClass
        copyButton.textContent = originalText
        copyButton.prepend(icon)
      }, 2000)
    }
  })

  scriptDetailsModal.style.display = "flex"
}

function setupScriptHubEvents() {
  scriptsGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".script-card")
    if (card && !e.target.closest(".card-button")) {
      const scriptId = card.getAttribute("data-id")
      const script = scriptsData.find((s) => s._id === scriptId)
      if (script) {
        displayScriptDetails(script)
      }
    }

    const copyBtn = e.target.closest(".card-button.copy")
    if (copyBtn) {
      e.stopPropagation()
      const scriptId = copyBtn.getAttribute("data-id")
      const script = scriptsData.find((s) => s._id === scriptId)
      handleCopyButton(copyBtn, script)
    }

    const executeBtn = e.target.closest(".card-button.execute")
    if (executeBtn) {
      e.stopPropagation()
      const scriptId = executeBtn.getAttribute("data-id")
      const script = scriptsData.find((s) => s._id === scriptId)
      handleExecuteButton(executeBtn, script)
    }
  })

  searchButton.addEventListener("click", () => {
    if (isSearching) return

    Querys = searchInput.value.trim()
    Modes = ""
    currentPage = 1
    isModes = !!Querys
    isModes ? searchScripts(Querys, Modes, currentPage) : fetchScripts(currentPage)
  })

  prevButton.addEventListener("click", () => {
    if (currentPage > 1 && !isSearching) {
      currentPage--
      if (isModes && Querys) {
        searchScripts(Querys, Modes, currentPage)
      } else {
        fetchScripts(currentPage)
      }
    }
  })

  nextButton.addEventListener("click", () => {
    if (!isSearching) {
      currentPage++
      if (isModes && Querys) {
        searchScripts(Querys, Modes, currentPage)
      } else {
        fetchScripts(currentPage)
      }
    }
  })

  reloadButton.addEventListener("click", async () => {
    if (isSearching) return

    searchInput.value = ""

    S_Cache.clear()
    currentPage = 1

    const reloadIcon = reloadButton.querySelector("i")
    reloadIcon.className = "fas fa-spinner fa-spin"
    reloadButton.disabled = true

    try {
      await fetchScripts(1)
    } finally {
      reloadIcon.className = "fas fa-sync-alt"
      reloadButton.disabled = false
    }
  })

  closeModal.addEventListener("click", () => {
    scriptDetailsModal.style.display = "none"
  })

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !isSearching) {
      searchButton.click()
    }
  })

  window.addEventListener("click", (e) => {
    if (e.target === scriptDetailsModal) {
      scriptDetailsModal.style.display = "none"
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && scriptDetailsModal.style.display === "flex") {
      scriptDetailsModal.style.display = "none"
    }
  })
}

async function handleCopyButton(btn, script) {
  if (!script || !script.script) {
    return
  }

  const icon = btn.querySelector("i")
  const originalClass = icon.className
  const originalText = btn.textContent

  icon.className = "fas fa-spinner fa-spin"
  btn.textContent = " Copying..."
  btn.prepend(icon)
  btn.disabled = true

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(script.script)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = script.script
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()

      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)
    }

    icon.className = "fas fa-check"
    btn.textContent = " Copied!"
    btn.prepend(icon)
  } catch (err) {
    console.error("Impossible to copy the text: ", err)

    icon.className = originalClass
    btn.textContent = originalText
    btn.prepend(icon)
  } finally {
    setTimeout(() => {
      btn.disabled = false
      icon.className = originalClass
      btn.textContent = originalText
      btn.prepend(icon)
    }, 2000)
  }
}

async function handleExecuteButton(btn, script) {
  if (!script) {
    return
  }

  const icon = btn.querySelector("i")
  const originalClass = icon.className
  const originalText = btn.textContent

  icon.className = "fas fa-spinner fa-spin"
  btn.textContent = " Executing..."
  btn.prepend(icon)
  btn.disabled = true

  try {
    if (script.key) {
      showNotification("This script requires a key", "warning")
    } else {
      if (editor) {
        editor.setValue(script.script)

        document.querySelector('[data-tab="editor"]').click()

        if (isAttached) {
          executeBtn.click()
        } else {
          showNotification("Script loaded. Attach to execute.", "info")
        }
      }

      icon.className = "fas fa-check"
      btn.textContent = " Executed!"
      btn.prepend(icon)
    }
  } catch (error) {
    console.error("Error executing script:", error)
    icon.className = originalClass
    btn.textContent = originalText
    btn.prepend(icon)
  } finally {
    setTimeout(() => {
      btn.disabled = false
      icon.className = originalClass
      btn.textContent = originalText
      btn.prepend(icon)
    }, 2000)
  }
}

const categories = document.querySelectorAll(".category")

categories.forEach((category) => {
  category.addEventListener("click", () => {
    categories.forEach((cat) => cat.classList.remove("active"))
    category.classList.add("active")
  })
})

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  const notificationIcon = notification.querySelector(".notification-icon i")
  const notificationTitle = notification.querySelector(".notification-title")
  const notificationMessage = notification.querySelector(".notification-message")

  switch (type) {
    case "success":
      notificationIcon.className = "fas fa-check-circle"
      notificationIcon.style.color = "#43b581"
      notificationTitle.textContent = "Success"
      break
    case "error":
      notificationIcon.className = "fas fa-times-circle"
      notificationIcon.style.color = "#f04747"
      notificationTitle.textContent = "Error"
      break
    case "warning":
      notificationIcon.className = "fas fa-exclamation-triangle"
      notificationIcon.style.color = "#faa61a"
      notificationTitle.textContent = "Warning"
      break
    case "info":
      notificationIcon.className = "fas fa-info-circle"
      notificationIcon.style.color = "#2196f3"
      notificationTitle.textContent = "Info"
      break
  }

  notificationMessage.textContent = message

  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}

const notificationClose = document.querySelector(".notification-close")
notificationClose.addEventListener("click", () => {
  document.getElementById("notification").classList.remove("show")
})

document.querySelector('[data-tab="scripthub"]').addEventListener("click", () => {
  if (scriptsGrid.children.length === 0) {
    initScriptHub()
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item, index) => {
    item.style.animationDelay = `${0.1 * (index + 1)}s`
  })

  const settingItems = document.querySelectorAll(".setting-item")
  settingItems.forEach((item, index) => {
    item.style.animationDelay = `${0.05 * (index + 1)}s`
  })
})

const smoothCursorToggle = document.getElementById("smooth-cursor-toggle")
smoothCursorToggle.addEventListener("change", () => {
  const smoothCursorEnabled = smoothCursorToggle.checked

  if (editor) {
    editor.updateOptions({
      cursorBlinking: smoothCursorEnabled ? "smooth" : "blink",
      cursorSmoothCaretAnimation: smoothCursorEnabled ? "on" : "off",
    })
  }
})
