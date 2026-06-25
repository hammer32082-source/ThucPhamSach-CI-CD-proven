(function () {
    function getCategoryPagePath() {
        const path = window.location.pathname.replace(/\\/g, "/");
        if (path.includes("/category/")) {
            return "category.html";
        }

        if (/(\/(product|cart|orders|login|register|admin)\/)/.test(path)) {
            return "../category/category.html";
        }

        return "category/category.html";
    }

    function getCategoryId(item) {
        return TPS.getField(item, "maDanhMuc", "MaDanhMuc");
    }

    function getCategoryName(item) {
        return TPS.viText(TPS.getField(item, "tenDanhMuc", "TenDanhMuc"));
    }

    function isCategoryActive(rootId, childIds, currentMaDanhMuc, currentMaDanhMucCha) {
        if (currentMaDanhMucCha === rootId) {
            return true;
        }

        if (currentMaDanhMuc && childIds.includes(currentMaDanhMuc)) {
            return true;
        }

        return false;
    }

    function renderCategoryMenu(container, categories) {
        const categoryPath = getCategoryPagePath();
        const params = new URLSearchParams(window.location.search);
        const currentMaDanhMuc = params.get("maDanhMuc") || "";
        const currentMaDanhMucCha = params.get("maDanhMucCha") || "";
        const tree = TPS.buildCategoryTree(categories);

        if (!tree.length) {
            container.innerHTML = `<p class="cat-menu-empty">Chưa có danh mục</p>`;
            return;
        }

        container.innerHTML = tree.map(({ root, children }) => {
            const rootId = getCategoryId(root);
            const rootName = getCategoryName(root);
            const childIds = children.map(getCategoryId);
            const activeClass = isCategoryActive(rootId, childIds, currentMaDanhMuc, currentMaDanhMucCha) ? " active" : "";

            const subLinks = children.map((child) => {
                const childId = getCategoryId(child);
                const childName = getCategoryName(child);
                return `<a href="${categoryPath}?maDanhMuc=${encodeURIComponent(childId)}">${TPS.escapeHtml(childName)}</a>`;
            }).join("");

            return `
                <div class="cat-item${activeClass}" data-cat-item data-cat-id="${rootId}">
                    <span class="cat-item-link">${TPS.escapeHtml(rootName)}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
                    <div class="cat-sub">
                        <p class="cat-sub-label">Danh mục con</p>
                        ${subLinks || `<span class="cat-sub-empty">Chưa có danh mục con</span>`}
                    </div>
                </div>
            `;
        }).join("");

        // Attach hover events to each cat-item
        container.querySelectorAll(".cat-item").forEach(catItem => {
            const catSub = catItem.querySelector(".cat-sub");
            const catItemLink = catItem.querySelector(".cat-item-link");
            const itemId = catItem.getAttribute("data-cat-id");
            
            if (catSub && catItemLink) {
                // Make the link clickable
                catItemLink.style.cursor = "pointer";
                catItemLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.location.href = `${categoryPath}?maDanhMucCha=${encodeURIComponent(itemId)}`;
                });

                // Hover events
                catItem.addEventListener("mouseenter", () => {
                    catSub.style.display = "block";
                });

                catItem.addEventListener("mouseleave", (e) => {
                    // Keep visible if moving to cat-sub
                    if (!e.relatedTarget || !catSub.contains(e.relatedTarget)) {
                        catSub.style.display = "none";
                    }
                });

                // Keep cat-sub visible when hovering over it
                catSub.addEventListener("mouseenter", () => {
                    catSub.style.display = "block";
                });

                catSub.addEventListener("mouseleave", (e) => {
                    if (!e.relatedTarget || !catItem.contains(e.relatedTarget)) {
                        catSub.style.display = "none";
                    }
                });
            }
        });
    }

    async function initCategoryMenu() {
        const container = document.querySelector("[data-category-menu]");
        if (!container || !window.TPS) {
            return;
        }

        try {
            // Add cache-busting parameter to ensure fresh data
            const payload = await TPS.request(`/api/DanhMuc?_t=${Date.now()}`);
            const categories = TPS.unwrap(payload) || [];
            renderCategoryMenu(container, categories);
            sessionStorage.setItem("lastCategoryRender", Date.now().toString());
        } catch (error) {
            container.innerHTML = `<p class="cat-menu-empty">Không tải được danh mục. ${TPS.escapeHtml(error.message || "")}</p>`;
        }
    }

    document.addEventListener("DOMContentLoaded", initCategoryMenu);

    // Listen for category updates from other pages via localStorage
    window.addEventListener("storage", (event) => {
        if (event.key === "categoryUpdate" && event.newValue) {
            initCategoryMenu();
        }
    });

    // Also check for updates when the page becomes visible (user switches tabs)
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && document.querySelector("[data-category-menu]")) {
            const lastUpdate = localStorage.getItem("categoryUpdate");
            const lastRender = sessionStorage.getItem("lastCategoryRender");
            if (lastUpdate && (!lastRender || parseInt(lastUpdate) > parseInt(lastRender))) {
                initCategoryMenu();
            }
        }
    });

    // Refresh menu every time the category menu button is clicked
    document.addEventListener("click", (event) => {
        if (event.target.closest(".cat-menu-btn")) {
            initCategoryMenu();
        }
    });

    window.TPSCategoryMenu = {
        refresh: async () => {
            // Signal to other pages that categories have been updated
            localStorage.setItem("categoryUpdate", Date.now().toString());
            
            const container = document.querySelector("[data-category-menu]");
            if (!container || !window.TPS) {
                return;
            }

            try {
                // Add cache-busting parameter to ensure fresh data
                const payload = await TPS.request(`/api/DanhMuc?_t=${Date.now()}`);
                const categories = TPS.unwrap(payload) || [];
                renderCategoryMenu(container, categories);
                sessionStorage.setItem("lastCategoryRender", Date.now().toString());
            } catch (error) {
                container.innerHTML = `<p class="cat-menu-empty">Không tải được danh mục. ${TPS.escapeHtml(error.message || "")}</p>`;
            }
        }
    };
})();
