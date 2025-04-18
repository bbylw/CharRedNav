const body = document.body;
const categoryNav = document.getElementById("categoryNav");
const searchInput = document.getElementById("searchInput");
const categories = document.querySelectorAll(".category:not(#noResults)");
const linkCards = document.querySelectorAll(".link-card");
const noResults = document.getElementById("noResults");

function initTheme() {
  document.body.classList.add("dark");
  document.documentElement.style.background = "var(--bg-main)";
  document.documentElement.style.backgroundColor = "var(--bg-main)";
  document.body.style.backgroundColor = "var(--bg-main)";

  // 移除可能存在的遮罩元素
  const overlays = document.querySelectorAll('.overlay, [class*="overlay"], [id*="overlay"], [style*="position: fixed"]');
  overlays.forEach(el => {
    el.remove();
  });
}

categoryNav.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  categoryNav.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");

  const category = button.dataset.category;
  filterByCategory(category);
});

function filterByCategory(category) {
  console.log(`Filtering by category: ${category}`); // 添加日志
  searchInput.value = "";

  // 确保背景色正确
  document.documentElement.style.backgroundColor = "var(--bg-main)";
  document.body.style.backgroundColor = "var(--bg-main)";

  // 移除可能存在的遮罩元素
  const overlays = document.querySelectorAll('.overlay, [class*="overlay"], [id*="overlay"], [style*="position: fixed"]');
  overlays.forEach(el => {
    el.remove();
  });

  let hasVisibleContent = false;

  if (category === "all") {
    console.log('Showing all categories'); // 添加日志
    categories.forEach((cat) => {
      cat.classList.remove("hidden");
      console.log(`Removed hidden from: ${cat.id}`); // 添加日志
    });
    // No need to explicitly show cards if parent sections are shown
    hasVisibleContent = true; // Assume 'all' always has content
    noResults.style.display = "none";
  } else {
    console.log(`Showing specific category: ${category}`); // 添加日志
    categories.forEach((cat) => {
      if (cat.id === category) {
        cat.classList.remove("hidden");
        console.log(`Removed hidden from: ${cat.id}`); // 添加日志
        // Check if this category actually has cards inside
        if (cat.querySelector('.link-card')) {
          hasVisibleContent = true;
        }
      } else {
        cat.classList.add("hidden");
        console.log(`Added hidden to: ${cat.id}`); // 添加日志
      }
    });
    // Remove the redundant loop for individual cards
    // linkCards.forEach((card) => { ... });
  }

  // Show 'no results' only if a specific category was selected and it was empty
  noResults.style.display = hasVisibleContent ? "none" : "block";
  console.log(`Set noResults display to: ${noResults.style.display}`); // 添加日志

  // 清除可能的白色遮罩，只需调用一次
  // clearWhiteOverlay(); // 暂时注释掉以排查问题
}

// --- Debounce Function ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- Search Function (extracted for clarity) ---
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  // Reset active category button
  categoryNav.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
  categoryNav
    .querySelector('[data-category="all"]')
    .classList.add("active");

  // Ensure all categories are potentially visible before filtering cards
  categories.forEach((cat) => {
    cat.classList.remove("hidden");
  });

  if (searchTerm === "") {
    linkCards.forEach((card) => {
      card.classList.remove("hidden-card");
      const title = card.querySelector("h3");
      // Restore original text if possible, or just remove mark
      const originalText = card.dataset.originalTitle || title.textContent;
      title.innerHTML = originalText; // Remove mark
      card.dataset.originalTitle = originalText; // Store original title if not already stored
    });
    noResults.style.display = "none";
    // Hide empty categories again if needed (though maybe not desirable when clearing search)
    categories.forEach((category) => {
      if (category.id !== "noResults" && !category.querySelector(".link-card:not(.hidden-card)")) {
        // category.classList.add("hidden"); // Optional: hide empty categories on clear?
      }
    });
    return;
  }

  let hasResults = false;

  linkCards.forEach((card) => {
    const title = card.querySelector("h3");
    // Store original title before highlighting
    if (!card.dataset.originalTitle) {
         card.dataset.originalTitle = title.textContent;
    }
    const titleText = card.dataset.originalTitle.toLowerCase(); // Search in original text

    if (titleText.includes(searchTerm)) {
      card.classList.remove("hidden-card");
      hasResults = true;

      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      // Highlight based on original text
      title.innerHTML = card.dataset.originalTitle.replace(regex, "<mark>$1</mark>");
    } else {
      card.classList.add("hidden-card");
      title.innerHTML = card.dataset.originalTitle; // Restore original text if hidden
    }
  });

  // Hide categories that have no visible cards after search
  categories.forEach((category) => {
    if (category.id === "noResults") return;
    // Check if any card within this category is NOT hidden
    const hasVisibleCards = category.querySelector(".link-card:not(.hidden-card)");
    if (!hasVisibleCards) {
      category.classList.add("hidden");
    } else {
      category.classList.remove("hidden"); // Ensure category is visible if it has results
    }
  });

  noResults.style.display = hasResults ? "none" : "block";
}

// --- Debounced Search Event Listener ---
searchInput.addEventListener("input", debounce(performSearch, 300)); // Apply debounce with 300ms delay

initTheme();

window.addEventListener("load", () => {
  checkNavOverflow();
  clearWhiteOverlay();

  // 添加渐变动画效果
  document.querySelectorAll('.link-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.03}s`;
  });

  // 添加一个全屏黑色背景元素作为底层
  const bgFix = document.createElement('div');
  bgFix.style.position = 'fixed';
  bgFix.style.top = '0';
  bgFix.style.left = '0';
  bgFix.style.width = '100vw';
  bgFix.style.height = '100vh';
  bgFix.style.backgroundColor = 'var(--bg-main)';
  bgFix.style.zIndex = '-9999';
  bgFix.style.pointerEvents = 'none';
  document.body.appendChild(bgFix);

  // 修复链接无法打开的问题
  const linkCards = document.querySelectorAll('.link-card');
  linkCards.forEach(card => {
    // 移除tabindex属性
    card.removeAttribute('tabindex');

    // 确保链接可以正常点击
    const link = card.querySelector('a');
    if (link) {
      link.style.zIndex = '10';
      link.style.pointerEvents = 'auto';
    }

    // 添加点击事件处理程序
    card.addEventListener('click', function (e) {
      const link = this.querySelector('a');
      if (link && e.target !== link) {
        link.click();
      }
    });
  });
});

window.addEventListener("resize", () => {
  checkNavOverflow();
  clearWhiteOverlay();
});

// 禁用粒子效果但允许基本过渡效果的函数
function disableAllAnimations() {
  // 创建一个样式表来禁用粒子效果但允许基本过渡
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .link-card {
      animation: fadeIn 0.3s ease-out forwards;
    }

    canvas {
      display: none !important;
    }

    [class*="particle"], [id*="particle"], [class*="animation"]:not(.link-card), [id*="animation"] {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);

  // 移除所有canvas元素（粒子效果通常使用canvas）
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    canvas.remove();
  });

  // 移除可能的粒子容器，但保留基本UI元素
  const particleContainers = document.querySelectorAll('[class*="particle"], [id*="particle"], [class*="animation"]:not(.link-card):not(.navbar):not(.search-bar):not(.icon-wrapper), [id*="animation"]');
  particleContainers.forEach(container => {
    container.style.display = 'none';
    container.style.opacity = '0';
    container.style.visibility = 'hidden';
  });
}

// 清除白色遮罩函数
let clearWhiteOverlayExecuted = false;
function clearWhiteOverlay() {
  // 使用防抖技术，避免频繁调用
  if (clearWhiteOverlayExecuted) return;
  clearWhiteOverlayExecuted = true;
  setTimeout(() => { clearWhiteOverlayExecuted = false; }, 300);

  // 禁用粒子效果但允许基本过渡
  if (!window.animationsDisabled) {
    disableAllAnimations();
    window.animationsDisabled = true;
  }

  // 确保背景色正确
  document.documentElement.style.backgroundColor = "var(--bg-main)";
  document.body.style.backgroundColor = "var(--bg-main)";
  document.documentElement.style.background = "var(--bg-main)";
  document.body.style.background = "var(--bg-main)";
  document.documentElement.style.backgroundImage = "none";
  document.body.style.backgroundImage = "none";

  // 强制设置主要容器的背景
  const main = document.querySelector('.main');
  if (main) {
    main.style.backgroundColor = "var(--bg-main)";
    main.style.backgroundImage = "none";
  }

  const header = document.querySelector('.header');
  if (header) {
    header.style.backgroundColor = "var(--bg-main)";
    header.style.backgroundImage = "none";
  }

  // 移除可能存在的遮罩元素，使用更高效的选择器
  const overlays = document.querySelectorAll('.overlay, [id*="overlay"], [style*="position: fixed"][style*="background"]');
  overlays.forEach(el => {
    el.style.backgroundColor = 'transparent';
    el.style.backgroundImage = 'none';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  });

  // 使用更高效的方式处理白色背景
  if (!window.whiteOverlayStyleAdded) {
    const style = document.createElement('style');
    style.innerHTML = `
      body > *:not(.link-card):not(.navbar):not(.search-bar):not(.icon-wrapper):not(button):not(input) {
        background-color: var(--bg-main) !important;
        background-image: none !important;
      }

      [style*="background"][style*="rgb(255"],
      [style*="background"][style*="#fff"],
      [style*="background"][style*="white"] {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
    `;
    document.head.appendChild(style);
    window.whiteOverlayStyleAdded = true;
  }
}

function checkNavOverflow() {
  const nav = document.getElementById("categoryNav");
  if (nav.scrollWidth > nav.clientWidth) {
    nav.classList.add("has-overflow");
  } else {
    nav.classList.remove("has-overflow");
  }
}

// 使用节流技术优化滚动事件
let scrollTimeout;
categoryNav.addEventListener("scroll", function () {
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(() => {
    if (this.scrollLeft > 0) {
      this.classList.add("scrolled-left");
    } else {
      this.classList.remove("scrolled-left");
    }

    if (this.scrollLeft + this.clientWidth >= this.scrollWidth - 5) {
      this.classList.add("scrolled-right");
    } else {
      this.classList.remove("scrolled-right");
    }
    scrollTimeout = null;
  }, 10);
});

// 添加平滑滚动效果
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

const supportsTransition =
  CSS.supports("background-image", "linear-gradient(red, blue)") &&
  CSS.supports("transition", "background 0.3s");

if (supportsTransition) {
  document.documentElement.classList.add("supports-transitions");
}