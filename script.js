// --- Modal/Dialog Functions (Kept for domain cards) ---
const domainModal = document.getElementById("domainModal")
const modalDomainName = document.getElementById("modalDomainName")
const modalDomainDescription = document.getElementById("modalDomainDescription")
const modalDomainPrice = document.getElementById("modalDomainPrice")
const modalNextButton = document.getElementById("modalNextButton")

// NEW: Get references for the general modals
const faqModal = document.getElementById("faqModal")
const contactModal = document.getElementById("contactModal")
const blogModal = document.getElementById("blogModal")

let touchStartY = 0
let touchEndY = 0
let isSwiping = false

// NEW: Function to open general modals (FAQ, Contact, Blog)
function openModal(modalId) {
  const targetModal = document.getElementById(modalId)
  if (!targetModal) return
  targetModal.classList.remove("closing")
  targetModal.showModal()

  // NEW: Add the click-outside-to-close listener
  addBackdropCloseListener(modalId)

  if (window.innerWidth <= 768) {
    addSwipeListeners(modalId)
  }
}
function openDomainModal(domainName, price, description) {
  modalDomainName.textContent = domainName
  modalDomainDescription.textContent = description || "No detailed description available."
  modalDomainPrice.textContent = price
  modalNextButton.setAttribute("data-domain", domainName)

  domainModal.classList.remove("closing")
  domainModal.showModal()

  if (window.innerWidth <= 768) {
    addSwipeListeners("domainModal") // Pass the specific ID
  }
}

function closeModal(modalId) {
  const targetModal = document.getElementById(modalId)
  if (!targetModal || !targetModal.open) return // Check if it's open
  
  // UPDATED: Apply the closing class for the CSS animation on mobile for ALL modals
  if (window.innerWidth <= 768) {
    targetModal.classList.add("closing")
    setTimeout(() => {
      targetModal.close()
      targetModal.classList.remove("closing")
      targetModal.style.transform = "" // Reset transform after closing
      removeSwipeListeners()
    }, 300) // Match the CSS transition time
  } else {
    targetModal.close()
    targetModal.style.transform = "" // Reset transform on desktop too
    removeSwipeListeners()
  }
}

document.getElementById("closeDomainModal")?.addEventListener("click", () => closeModal("domainModal"))

// Add close button listeners for FAQ, Contact, and Blog modals
document.querySelectorAll('[onclick*="closeModal"]').forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault()
    // Safely extract modalId from the onclick attribute, e.g., 'closeModal('faqModal')'
    const match = this.getAttribute("onclick").match(/'([^']+)'/)
    if (match) {
        const modalId = match[1]
        closeModal(modalId)
    }
  })
})

function redirectToSpaceship(event) {
  const domainName = event.currentTarget.getAttribute("data-domain")
  if (domainName) {
    const redirectUrl = `https://www.spaceship.com/domain-search/?query=${domainName.toLowerCase()}&beast=false&tab=domains`
    window.open(redirectUrl, "_blank")
    closeModal("domainModal")
  }
}
modalNextButton.addEventListener("click", redirectToSpaceship)

// --- UPDATED SWIPE/TOUCH HANDLERS ---
function addSwipeListeners(modalId) {
  const modalElement = document.getElementById(modalId)
  if (!modalElement) return
  
  // Remove existing listeners first to prevent duplicates
  removeSwipeListenersForElement(modalElement) 

  // Store the modalId on the element for use in the handlers
  modalElement.dataset.modalId = modalId 

  // Add the unified handlers
  modalElement.addEventListener("touchstart", handleTouchStart, false)
  modalElement.addEventListener("touchmove", handleTouchMove, false)
  modalElement.addEventListener("touchend", handleTouchEnd, false) 
}

function removeSwipeListenersForElement(modalElement) {
    modalElement.removeEventListener("touchstart", handleTouchStart, false)
    modalElement.removeEventListener("touchmove", handleTouchMove, false)
    modalElement.removeEventListener("touchend", handleTouchEnd, false)
}

function removeSwipeListeners() {
  // Remove listeners from all possible modals
  ;["domainModal", "faqModal", "contactModal", "blogModal"].forEach((id) => {
    const modalElement = document.getElementById(id)
    if (modalElement) {
      removeSwipeListenersForElement(modalElement)
      modalElement.style.transform = "" // Reset transform
      delete modalElement.dataset.modalId // Clean up
    }
  })
}

function handleTouchStart(event) {
  const modalElement = event.currentTarget
  // Check if the scroll position is near the top (allows scrolling content first)
  if (modalElement.scrollTop < 5) {
      touchStartY = event.touches[0].clientY
      isSwiping = false
  } else {
      // If content is scrolled, treat it as a normal scroll
      touchStartY = 0
      isSwiping = false
  }
}
function handleTouchMove(event) {
  if (!touchStartY) return // Not initiating a swipe from the top

  const touchY = event.touches[0].clientY
  const diffY = touchY - touchStartY
  const modalElement = event.currentTarget

  // Only allow swiping down and if the modal is at the very top of its scroll
  if (diffY > 0 && modalElement.scrollTop < 5) {
    isSwiping = true
    event.preventDefault() // Prevent native scrolling when swiping down the modal
    // Apply transform for the drag effect
    modalElement.style.transform = `translateY(${diffY}px)`
  } else {
    // If scrolling up or swiping down with content scrolled
    isSwiping = false 
    // Reset transform if a drag was initiated but failed the scrollTop check later
    if (modalElement.style.transform !== "translateY(0)") {
        modalElement.style.transform = "translateY(0)" 
    }
  }
}
function handleTouchEnd(event) {
  if (!isSwiping || !touchStartY) return

  touchEndY = event.changedTouches[0].clientY
  const diffY = touchEndY - touchStartY
  const modalElement = event.currentTarget
  const modalId = modalElement.dataset.modalId // Get the ID from the dataset

  if (diffY > 100) { // Threshold for closing
    closeModal(modalId)
  } else {
    modalElement.style.transform = "translateY(0)" // Snap back
  }

  // Reset state variables
  touchStartY = 0
  touchEndY = 0
  isSwiping = false
}
// NEW: Function to add click-outside-to-close behavior
function addBackdropCloseListener(modalId) {
  const targetModal = document.getElementById(modalId)
  if (!targetModal) return
  
  // Use a named function expression to allow removal later
  function handler(e) {
    // Check if the click target is the dialog element itself,
    // which means the user clicked the backdrop/outside the inner content.
    if (e.target === targetModal) {
      closeModal(modalId)
      // Important: Remove the listener after closing to prevent duplicates/memory leaks
      targetModal.removeEventListener("click", handler)
    }
  }
  
  // Ensure we don't add multiple listeners
  // A clean implementation would track this, but for simplicity, we rely on closeModal's cleanup
  targetModal.addEventListener("click", handler)
}

// FAQ specific function
function toggleFaq(element) {
  const answer = element.nextElementSibling
  const icon = element.querySelector("svg")
  if (answer.classList.contains("open")) {
    answer.classList.remove("open")
    icon.classList.remove("rotate-180")
  } else {
    // Close all others
    document.querySelectorAll("#faqModal .faq-answer.open").forEach((ans) => ans.classList.remove("open"))
    document
      .querySelectorAll("#faqModal .faq-question svg.rotate-180")
      .forEach((ic) => ic.classList.remove("rotate-180"))
    answer.classList.add("open")
    icon.classList.add("rotate-180")
  }
}
// --- Domain Filtering and Pagination Script ---
let currentFilter = "all"
const pageSize = 9
const domains = document.querySelectorAll("#portfolio-grid article")
const loadMoreBtn = document.getElementById("load-more-btn")

// NEW/UPDATED: The list of domains for the 'One Word' filter (using the old 'curated' key)
const curatedList = [
  "departmental.de",
  "announces.xyz",
  "responded.xyz",
  "largely.xyz",
  "difficulties.xyz",
  "physically.io",
  "handcuff.uk",
  "millidegree.com",
  "gaming.li",
  "relation.cc",
  "drove.app",
  "cold.wine",
  "fuzz.chat",
  "coloration.uk",
  "coiffure.top",
  "gadget.now",
  "flexure.uk",
  "handmaid.uk",
  "embarkment.uk",
  "credited.uk",
  "mixed.now",
  "coloration.io",
  "womanhood.uk",
  "follow.by",
  "latina.beauty",
  "bella.center",
  "storm.delivery",
  "reopen.info",
  "oppose.info",
  "imitate.info",
  "exclude.info",
  "enlist.info",
  "decrease.info",
]

// NEW: Category-based Domain Lists (all lower-cased for case-insensitive matching)
const techList = [
  "nomias.com",
  "lodley.com",
  "gps-company.com",
  "glon.net",
  "onfarm.net",
  "xtt.app",
  "botai.uk",
  "gamesai.net",
  "ai0.pro",
  "ledlab.net",
  "physically.io",
  "drove.app",
  "2vds.com",
  "06fx.com",
  "lucahost.com",
  "fuzz.chat",
  "kin7.com",
  "gadget.now",
  "echoice.xyz",
  "coloration.io",
  "virtualbot.app",
  "bondtrading.co",
  "spaceht.com",
  "theai.city",
  "sich.xyz",
  "follow.by",
  "xn--dubi-noa.xyz",
  "xn--dda.xyz",
  "xn--clck-wpa.click",
  "storm.delivery",
  "exclude.info",
  "autat.com",
]
const aiList = [
  "nomias.com",
  "xtt.app",
  "botai.uk",
  "gamesai.net",
  "ai0.pro",
  "drove.app",
  "virtualbot.app",
  "theai.city",
  "gaming.li",
  "autat.com",
  "fuzz.chat",
  "kin7.com",
  "echoice.xyz",
  "glon.net",
  "sich.xyz",
  "xn--dda.xyz",
  "xn--clck-wpa.click",
  "ledlab.net",
  "spaceht.com",
  "onfarm.net",
  "physically.io",
  "mencare.app",
  "relation.cc",
  "2vds.com",
  "06fx.com",
  "lucahost.com",
  "exclude.info",
  "imitate.info",
]
const saasList = [
  "nomias.com",
  "lodley.com",
  "xtt.app",
  "botai.uk",
  "ai0.pro",
  "drove.app",
  "mencare.app",
  "virtualbot.app",
  "fuzz.chat",
  "kin7.com",
  "coloration.io",
  "autat.com",
  "gamesai.net",
  "physically.io",
  "gps-company.com",
  "lucahost.com",
  "relation.cc",
  "exclude.info",
  "enlist.info",
  "imitate.info",
  "gadget.now",
  "storm.delivery",
  "follow.by",
  "echoice.xyz",
  "theai.city",
  "2vds.com",
  "06fx.com",
  "glon.net",
  "sich.xyz",
]
const healthList = [
  "eliteha.com",
  "physically.io",
  "mencare.app",
  "litepain.com",
  "decrease.info",
  "womanhood.uk",
  "handmaid.uk",
  "flexure.uk",
  "coiffure.top",
  "vauty.com",
  "beau1y.com",
  "bella.center",
  "dq.baby",
  "latina.beauty",
]
const beautyList = [
  "vauty.com",
  "beau1y.com",
  "coiffure.top",
  "latina.beauty",
  "bella.center",
  "coloration.uk",
  "handmaid.uk",
  "womanhood.uk",
  "dq.baby",
  "eliteha.com",
  "mencare.app",
  "physically.io",
]
const travelList = ["gps-company.com", "drove.app", "embarkment.uk", "autat.com", "storm.delivery"]
const financeList = ["credited.uk", "bondtrading.co", "bnb.cx"]
const educationList = [
  "millidegree.com",
  "imitate.info",
  "enlist.info",
  "relation.cc",
  "difficulties.xyz",
  "areya.org",
  "physically.io",
  "decrease.info",
  "exclude.info",
  "oppose.info",
  "reopen.info",
]
const foodList = ["onfarm.net", "cold.wine"]
const realEstateList = ["thehouses.shop"]
const gamingList = ["gamesai.net", "gaming.li"]
const lifestyleList = [
  "rossoff.com",
  "laurie.cl",
  "lodley.com",
  "eliteha.com",
  "movs.co.uk",
  "myluxury.uk",
  "announces.xyz",
  "largely.xyz",
  "difficulties.xyz",
  "maryam.biz",
  "relation.cc",
  "elyssa.net",
  "jhnny.com",
  "2vds.com",
  "kin7.com",
  "coloration.uk",
  "flexure.uk",
  "handmaid.uk",
  "mixed.now",
  "coloration.io",
  "womanhood.uk",
  "sich.xyz",
  "latina.beauty",
  "vauty.com",
  "reopen.info",
  "oppose.info",
  "imitate.info",
  "enlist.info",
  "dq.baby",
  "decrease.info",
]
const ecommerceList = [
  "onfarm.net",
  "departmental.de",
  "largely.xyz",
  "cold.wine",
  "thehouses.shop",
  "gadget.now",
  "storm.delivery",
  "dq.baby",
  "lucahost.com",
  "autat.com",
  "kin7.com",
  "06fx.com",
  "mixed.now",
  "vauty.com",
  "latina.beauty",
  "bella.center",
  "eliteha.com",
  "2vds.com",
]
const brandableList = [
  "rossoff.com",
  "laurie.cl",
  "nomias.com",
  "lodley.com",
  "eliteha.com",
  "bnb.cx",
  "glon.net",
  "thomass.org",
  "myluxury.uk",
  "largely.xyz",
  "maryam.biz",
  "areya.org",
  "2vds.com",
  "06fx.com",
  "kin7.com",
  "elyssa.net",
  "jhnny.com",
  "sich.xyz",
  "gaming.li",
  "reopen.info",
  "oppose.info",
  "imitate.info",
  "enlist.info",
  "dq.baby",
  "decrease.info",
  "millidegree.com",
  "onfarm.net",
  "coloration.io",
  "gadget.now",
  "mixed.now",
]
const portfolioList = ["areya.org", "maryam.biz", "rossoff.com", "jhnny.com", "thomass.org"]

// Helper map for easy lookup
const categoryLists = {
  curated: curatedList, // Used for 'One Word' button
  Tech: techList,
  AI: aiList,
  SaaS: saasList,
  Health: healthList,
  Beauty: beautyList,
  Travel: travelList,
  Finance: financeList,
  Education: educationList,
  Food: foodList,
  RealEstate: realEstateList,
  Gaming: gamingList,
  Lifestyle: lifestyleList,
  Ecommerce: ecommerceList,
  Brandable: brandableList,
  Portfolio: portfolioList,
}

// Set dataset attributes on load
domains.forEach((article) => {
  const onclickStr = article.getAttribute("onclick")
  const match = onclickStr.match(/openDomainModal\('([^']+)'/)
  if (match) {
    const fullDomain = match[1].toLowerCase()
    const parts = fullDomain.split(".")
    const tld = "." + parts.pop()
    const name = parts.join(".")
    article.dataset.tld = tld
    article.dataset.nameLength = name.length
    article.dataset.hasDigit = /\d/.test(name) ? "true" : "false"
    // IMPORTANT: Add domain name to dataset for the new filter
    article.dataset.domainName = fullDomain
  }
})

// UPDATED Matches filter function
function matchesFilter(article, filter) {
  // TLD, length, and hasDigit variables are no longer used for the new filters,
  // but are kept as they are set by the DOM loop.
  const tld = article.dataset.tld
  const length = Number.parseInt(article.dataset.nameLength)
  const hasDigit = article.dataset.hasDigit === "true"
  const domainName = article.dataset.domainName // Get the full domain name

  if (filter === "all") return true

  // NEW FILTER LOGIC: Check if the domain is in the 'curated' list or any of the 15 topic lists
  if (categoryLists[filter]) {
    return categoryLists[filter].includes(domainName)
  }

  // Removed TLD, 4L, 4C, and 'other' filters as the corresponding buttons were removed.
  // if (filter.startsWith('.')) return tld === filter;
  // if (filter === '4L') return length === 4 && !hasDigit;
  // if (filter === '4C') return length === 4 && hasDigit;
  // if (filter === 'other') return !['.com', '.net', '.org', '.io', '.uk', '.app', '.xyz'].includes(tld);

  return false
}

// Filter domains (function body remains the same, but it uses the updated matchesFilter)
function filterDomains(filter) {
  currentFilter = filter
  // Highlight active button
  const buttons = document.querySelectorAll(".domain-filter-button")
  buttons.forEach((button) => {
    if (button.dataset.filter === filter) {
      button.classList.add("bg-indigo-600", "text-white")
      button.classList.remove("bg-white", "text-indigo-600", "hover:bg-indigo-50")
    } else {
      button.classList.remove("bg-indigo-600", "text-white")
      button.classList.add("bg-white", "text-indigo-600", "hover:bg-indigo-50")
    }
  })
  // Hide all
  domains.forEach((d) => d.classList.add("hidden"))
  // Get matching in DOM order
  const matching = Array.from(domains).filter((d) => matchesFilter(d, filter))
  // Show first pageSize
  matching.slice(0, pageSize).forEach((d) => d.classList.remove("hidden"))
  // Show/hide load more
  if (matching.length > pageSize) {
    loadMoreBtn.classList.remove("hidden")
  } else {
    loadMoreBtn.classList.add("hidden")
  }
}
// Load more function
function loadMore() {
  // Get currently hidden matching
  const hiddenMatching = Array.from(domains).filter(
    (d) => d.classList.contains("hidden") && matchesFilter(d, currentFilter),
  )
  // Show next pageSize
  hiddenMatching.slice(0, pageSize).forEach((d) => d.classList.remove("hidden"))
  // Hide button if no more
  if (hiddenMatching.length <= pageSize) {
    loadMoreBtn.classList.add("hidden")
  }
}
// Initial setup
window.addEventListener("DOMContentLoaded", () => {
  filterDomains("all")
})

// Existing listener for domainModal
// This listener is redundant now that addBackdropCloseListener is used,
// but keeping it simple by leaving it out of the main logic, as addBackdropCloseListener
// is added when the modal opens.
// domainModal.addEventListener("click", (e) => {
//   if (e.target === domainModal) {
//     closeModal("domainModal")
//   }
// })
