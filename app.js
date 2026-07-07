/**
 * 智慧分类垃圾 - 主逻辑
 */
(function () {
  'use strict';

  // DOM 元素
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const searchStats = document.getElementById('searchStats');
  const categoryGrid = document.getElementById('categoryGrid');
  const resultSection = document.getElementById('resultSection');
  const resultTitle = document.getElementById('resultTitle');
  const resultList = document.getElementById('resultList');
  const resultEmpty = document.getElementById('resultEmpty');
  const hotSection = document.getElementById('hotSection');
  const hotGrid = document.getElementById('hotGrid');
  const allSection = document.getElementById('allSection');
  const categoryTabs = document.getElementById('categoryTabs');
  const allList = document.getElementById('allList');
  const backTopBtn = document.getElementById('backTopBtn');

  let currentCategory = 'all'; // 当前选中的分类 tab
  let lastSearchTerm = ''; // 记录上次搜索

  // ==================== 初始化 ====================
  function init() {
    renderCategoryCards();
    renderHotItems();
    renderCategoryTabs();
    renderAllList('all');
    bindEvents();
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
    window.addEventListener('scroll', handleScroll);
    backTopBtn.addEventListener('click', scrollToTop);
  }

  // ==================== 分类卡片 ====================
  function renderCategoryCards() {
    const cats = Object.values(CATEGORIES);
    categoryGrid.innerHTML = cats.map(cat => `
      <div class="category-card"
           style="--card-color: ${cat.color}; --card-bg: ${cat.bgColor}; --card-border: ${cat.borderColor}"
           data-category="${cat.key}">
        <div class="category-card-icon">${cat.emoji}</div>
        <div class="category-card-name">${cat.name}</div>
        <div class="category-card-desc">${cat.desc}</div>
        <div class="category-card-count" data-count-key="${cat.key}">
          ${getCategoryCount(cat.key)} 种常见物品
        </div>
      </div>
    `).join('');

    // 点击分类卡片
    categoryGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', function () {
        const cat = this.dataset.category;
        currentCategory = cat;
        updateCategoryTabs();
        renderAllList(cat);
        allSection.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function getCategoryCount(key) {
    return garbageData.filter(item => item.category === key).length;
  }

  // ==================== 热门垃圾 ====================
  function renderHotItems() {
    hotGrid.innerHTML = hotItems.map(item => {
      const cat = CATEGORIES[item.category];
      return `
        <div class="hot-card" data-name="${item.name}" data-category="${item.category}">
          <div class="hot-card-header">
            <span class="hot-card-emoji">${cat.emoji}</span>
            <span class="hot-card-name">${item.name}</span>
          </div>
          <span class="hot-card-tag" style="background:${cat.color}">${cat.name}</span>
          <p class="hot-card-tip">${item.tip}</p>
        </div>
      `;
    }).join('');

    // 点击热门卡片可搜索
    hotGrid.querySelectorAll('.hot-card').forEach(card => {
      card.addEventListener('click', function () {
        searchInput.value = this.dataset.name;
        handleSearch();
        searchInput.scrollIntoView({ behavior: 'smooth' });
        searchInput.focus();
      });
    });
  }

  // ==================== 分类 Tab ====================
  function renderCategoryTabs() {
    const tabs = [
      { key: 'all', name: '全部', emoji: '📦', color: '#2D8B4E' }
    ];
    Object.values(CATEGORIES).forEach(cat => {
      tabs.push({
        key: cat.key,
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color
      });
    });

    categoryTabs.innerHTML = tabs.map(tab => `
      <button class="tab-btn ${currentCategory === tab.key ? 'active' : ''}"
              data-category="${tab.key}"
              style="--tab-color: ${tab.color}">
        <span class="tab-emoji">${tab.emoji}</span>
        <span>${tab.name}</span>
      </button>
    `).join('');

    categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        currentCategory = this.dataset.category;
        updateCategoryTabs();
        renderAllList(currentCategory);
      });
    });
  }

  function updateCategoryTabs() {
    categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === currentCategory);
    });
  }

  // ==================== 全量列表 ====================
  function renderAllList(categoryKey) {
    let items = garbageData;
    if (categoryKey !== 'all') {
      items = garbageData.filter(item => item.category === categoryKey);
    }

    if (items.length === 0) {
      allList.innerHTML = '<div class="no-result">暂无数据</div>';
      return;
    }

    allList.innerHTML = items.map(item => {
      const cat = CATEGORIES[item.category];
      return `
        <div class="all-item" data-name="${item.name}">
          <span class="all-item-emoji">${cat.emoji}</span>
          <span class="all-item-name">${item.name}</span>
          <span class="all-item-tag" style="background:${cat.color}">${cat.name}</span>
        </div>
      `;
    }).join('');

    // 点击列表项可搜索
    allList.querySelectorAll('.all-item').forEach(el => {
      el.addEventListener('click', function () {
        searchInput.value = this.dataset.name;
        handleSearch();
        searchInput.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ==================== 搜索逻辑 ====================
  function handleSearch() {
    const term = searchInput.value.trim();
    lastSearchTerm = term;

    // 清除按钮显隐
    clearBtn.classList.toggle('visible', term.length > 0);

    if (term.length === 0) {
      // 清空搜索结果
      resultSection.style.display = 'none';
      searchStats.textContent = '';
      hotSection.style.display = 'block';
      allSection.style.display = 'block';
      return;
    }

    // 模糊搜索
    const filtered = garbageData.filter(item =>
      item.name.includes(term)
    );

    // 统计
    searchStats.textContent = `找到 ${filtered.length} 条相关结果`;

    // 显示隐藏
    resultSection.style.display = 'block';
    hotSection.style.display = 'none';
    allSection.style.display = 'none';

    if (filtered.length === 0) {
      resultList.innerHTML = '';
      resultEmpty.style.display = 'flex';
      resultTitle.textContent = `搜索"${term}"的结果`;
      return;
    }

    resultEmpty.style.display = 'none';
    resultTitle.textContent = `搜索"${term}"的结果（共 ${filtered.length} 条）`;

    resultList.innerHTML = filtered.map(item => {
      const cat = CATEGORIES[item.category];
      return `
        <div class="result-item">
          <div class="result-item-left">
            <span class="result-item-emoji">${cat.emoji}</span>
            <span class="result-item-name">${highlightMatch(item.name, term)}</span>
          </div>
          <span class="result-item-tag" style="background:${cat.color}">${cat.name}</span>
        </div>
      `;
    }).join('');
  }

  function highlightMatch(name, term) {
    const index = name.indexOf(term);
    if (index === -1) return name;
    return name.substring(0, index) +
      '<mark class="highlight">' + name.substring(index, index + term.length) + '</mark>' +
      name.substring(index + term.length);
  }

  function clearSearch() {
    searchInput.value = '';
    searchInput.focus();
    handleSearch();
  }

  // ==================== 回到顶部 ====================
  function handleScroll() {
    if (window.scrollY > 400) {
      backTopBtn.classList.add('visible');
    } else {
      backTopBtn.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== 启动 ====================
  init();
})();
