const productGrid = document.getElementById("product-grid");
const productStatus = document.getElementById("product-status");
const productCount = document.getElementById("product-count");
const categoryTitle = document.getElementById("category-title");
const breadcrumbTitle = document.getElementById("breadcrumb-title");
const breadcrumbParent = document.getElementById("breadcrumb-parent");
const sortSelect = document.getElementById("sort-select");
const priceFrom = document.getElementById("price-from");
const priceTo = document.getElementById("price-to");
const applyPriceFilter = document.getElementById("apply-price-filter");
const clearFiltersBtn = document.getElementById("clear-filters");
const originFilters = document.getElementById("origin-filters");
const subcategoryFilters = document.getElementById("subcategory-filters");
const headerSearchParent = document.getElementById("header-search-parent");

const urlParams = new URLSearchParams(window.location.search);
let maDanhMuc = urlParams.get("maDanhMuc") || "";
let maDanhMucCha = urlParams.get("maDanhMucCha") || "";
const initialKeyword = urlParams.get("tuKhoa") || "";

let allProducts = [];
let allCategories = [];
let activeParent = null;
let activeCategory = null;

function getCategoryId(item) {
    return TPS.getField(item, "maDanhMuc", "MaDanhMuc");
}

function getParentId(item) {
    return TPS.getField(item, "maDanhMucCha", "MaDanhMucCha");
}

function getCategoryName(item) {
    return TPS.viText(TPS.getField(item, "tenDanhMuc", "TenDanhMuc"));
}

function getChildCategories(parentId) {
    return TPS.getCategoryChildren(allCategories, parentId);
}

function buildApiQuery() {
    const params = new URLSearchParams();
    if (maDanhMuc) {
        params.set("maDanhMuc", maDanhMuc);
    } else if (maDanhMucCha) {
        params.set("maDanhMucCha", maDanhMucCha);
    }

    if (priceFrom?.value) params.set("giaMin", priceFrom.value);
    if (priceTo?.value) params.set("giaMax", priceTo.value);

    const query = params.toString();
    return query ? `/api/SanPham?${query}` : "/api/SanPham";
}

function getSelectedOrigins() {
    return [...originFilters.querySelectorAll("[data-origin-filter]:checked")].map((el) => el.value);
}

function getSelectedSubcategories() {
    return [...subcategoryFilters.querySelectorAll("[data-subcategory-filter]:checked")].map((el) => el.value);
}

function applyClientFilters(products) {
    let filtered = [...products];

    const keyword = document.getElementById("header-search-keyword")?.value.trim() || initialKeyword;
    if (keyword) {
        const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        filtered = filtered.filter((product) => {
            const tenSp = TPS.viText(TPS.getField(product, "tenSp", "TenSp"))
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            return tenSp.includes(normalizedKeyword);
        });
    }

    const selectedOrigins = getSelectedOrigins();
    if (selectedOrigins.length) {
        filtered = filtered.filter((product) => {
            const origin = TPS.viText(TPS.getField(product, "nguonGoc", "NguonGoc"));
            return selectedOrigins.includes(origin);
        });
    }

    const selectedSubcategories = getSelectedSubcategories();
    if (selectedSubcategories.length) {
        filtered = filtered.filter((product) => {
            const productCategoryId = TPS.getField(product, "maDanhMuc", "MaDanhMuc");
            return selectedSubcategories.includes(productCategoryId);
        });
    }

    const sortValue = sortSelect?.value || "asc";
    filtered.sort((a, b) => {
        const priceA = Number(TPS.getField(a, "gia", "Gia")) || 0;
        const priceB = Number(TPS.getField(b, "gia", "Gia")) || 0;
        return sortValue === "asc" ? priceA - priceB : priceB - priceA;
    });

    return filtered;
}

function updateProductCount(count) {
    if (productCount) {
        productCount.textContent = `${count} sản phẩm`;
    }
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = "";
        TPS.setStatus(productStatus, "Chưa có sản phẩm phù hợp.");
        updateProductCount(0);
        return;
    }

    TPS.hideStatus(productStatus);
    updateProductCount(products.length);

    productGrid.innerHTML = products.map((product) => {
        const maSp = TPS.getField(product, "maSp", "MaSp");
        const tenSp = TPS.viText(TPS.getField(product, "tenSp", "TenSp")) || "Sản phẩm";
        const gia = TPS.getField(product, "gia", "Gia");
        const soLuongTon = TPS.getField(product, "soLuongTon", "SoLuongTon");
        const donViTinh = TPS.viText(TPS.getField(product, "donViTinh", "DonViTinh")) || "Sản phẩm";
        const nguonGoc = TPS.viText(TPS.getField(product, "nguonGoc", "NguonGoc")) || "Đang cập nhật";
        const image = TPS.getProductImage(maSp, TPS.getField(product, "hinhAnh", "HinhAnh"));

        return `
            <article class="product-card" data-product-id="${TPS.escapeHtml(maSp)}" role="link" tabindex="0" aria-label="Xem chi tiết ${TPS.escapeHtml(tenSp)}">
                <div class="product-image-wrap">
                    <img class="product-image" src="${TPS.escapeHtml(image)}" alt="${TPS.escapeHtml(tenSp)}" loading="lazy">
                </div>
                <div class="product-body">
                    <h3 class="product-title">${TPS.escapeHtml(tenSp)}</h3>
                    <div class="product-meta">
                        ${TPS.renderCategoryChipHtml(product, allCategories)}
                        <span>${TPS.escapeHtml(donViTinh)}</span>
                        <span>${TPS.escapeHtml(nguonGoc)}</span>
                        <span>Tồn ${TPS.escapeHtml(soLuongTon)}</span>
                    </div>
                    <div class="product-footer">
                        <span class="price">${TPS.formatCurrency(gia)}</span>
                        <div class="product-buttons">
                            <button class="add-cart-button" type="button" data-add-cart="${TPS.escapeHtml(maSp)}" aria-label="Thêm vào giỏ hàng">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </button>
                            <button class="buy-button" type="button" data-checkout="${TPS.escapeHtml(maSp)}">Thanh toán ngay</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function renderOriginFilters(products) {
    const origins = [...new Set(
        products
            .map((product) => TPS.viText(TPS.getField(product, "nguonGoc", "NguonGoc")))
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "vi"));

    if (!origins.length) {
        originFilters.innerHTML = `<p class="filter-empty">Không có dữ liệu nguồn gốc</p>`;
        return;
    }

    originFilters.innerHTML = origins.map((origin) => `
        <label class="checkbox-row">
            <input type="checkbox" value="${TPS.escapeHtml(origin)}" data-origin-filter>
            ${TPS.escapeHtml(origin)}
        </label>
    `).join("");
}

function renderSubcategoryFilters(children) {
    if (!children.length) {
        subcategoryFilters.innerHTML = `<p class="filter-empty">Chưa có danh mục con. Hãy thêm trong trang Quản trị.</p>`;
        return;
    }

    subcategoryFilters.innerHTML = children.map((child) => {
        const childId = getCategoryId(child);
        const childName = getCategoryName(child);
        const checked = maDanhMuc === childId ? " checked" : "";
        return `
            <label class="checkbox-row">
                <input type="checkbox" value="${TPS.escapeHtml(childId)}" data-subcategory-filter${checked}>
                ${TPS.escapeHtml(childName)}
            </label>
        `;
    }).join("");
}

function resolveActiveCategories() {
    activeCategory = maDanhMuc
        ? allCategories.find((item) => getCategoryId(item) === maDanhMuc) || null
        : null;

    if (activeCategory) {
        maDanhMucCha = getParentId(activeCategory);
    }

    activeParent = maDanhMucCha
        ? allCategories.find((item) => getCategoryId(item) === maDanhMucCha) || null
        : null;

    if (!activeParent && !activeCategory && allCategories.length) {
        activeParent = allCategories.find((item) => !getParentId(item)) || null;
        maDanhMucCha = activeParent ? getCategoryId(activeParent) : "";
        maDanhMuc = "";
    }
}

function setPageTitle() {
    if (activeCategory) {
        const parent = allCategories.find((item) => getCategoryId(item) === getParentId(activeCategory));
        const title = getCategoryName(activeCategory);

        if (categoryTitle) categoryTitle.textContent = title;
        if (breadcrumbTitle) breadcrumbTitle.textContent = title;

        if (breadcrumbParent && parent) {
            breadcrumbParent.textContent = getCategoryName(parent);
            breadcrumbParent.closest(".breadcrumb-parent-wrap")?.classList.remove("is-hidden");
        }
    } else if (activeParent) {
        const title = getCategoryName(activeParent);

        if (categoryTitle) categoryTitle.textContent = title;
        if (breadcrumbTitle) breadcrumbTitle.textContent = title;
        breadcrumbParent?.closest(".breadcrumb-parent-wrap")?.classList.add("is-hidden");
    } else {
        const title = "Danh mục sản phẩm";
        if (categoryTitle) categoryTitle.textContent = title;
        if (breadcrumbTitle) breadcrumbTitle.textContent = title;
        breadcrumbParent?.closest(".breadcrumb-parent-wrap")?.classList.add("is-hidden");
    }

    if (headerSearchParent) {
        headerSearchParent.value = maDanhMucCha || "";
    }

    document.title = `${categoryTitle?.textContent || "Danh mục"} - Thực và vị`;
}

async function loadCategories() {
    const payload = await TPS.request("/api/DanhMuc");
    allCategories = TPS.unwrap(payload) || [];
    resolveActiveCategories();
    setPageTitle();
    renderSubcategoryFilters(activeParent ? getChildCategories(getCategoryId(activeParent)) : []);
}

async function fetchProducts() {
    try {
        TPS.setStatus(productStatus, "Đang tải sản phẩm...");
        productGrid.innerHTML = "";
        const payload = await TPS.request(buildApiQuery());
        allProducts = TPS.unwrap(payload) || [];
        renderOriginFilters(allProducts);
        const filtered = applyClientFilters(allProducts);
        renderProducts(filtered);
    } catch (error) {
        productGrid.innerHTML = "";
        TPS.setStatus(productStatus, `Không thể tải sản phẩm. Chi tiết: ${error.message}`, "error");
        updateProductCount(0);
    }
}

function applyFilters() {
    const filtered = applyClientFilters(allProducts);
    renderProducts(filtered);
}

function clearAllFilters() {
    if (priceFrom) priceFrom.value = "";
    if (priceTo) priceTo.value = "";
    document.querySelectorAll("[data-origin-filter], [data-subcategory-filter]").forEach((el) => {
        el.checked = false;
    });

    const searchInput = document.getElementById("header-search-keyword");
    if (searchInput) searchInput.value = "";

    maDanhMuc = "";
    fetchProducts();
}

async function addToCart(maSp) {
    const user = TPS.getUser();
    if (!TPS.getToken()) {
        window.location.href = "../login/login.html";
        return;
    }

    if (user?.vaiTro !== "KhachHang") {
        window.TPS?.showToast("Tài khoản Admin không thực hiện mua hàng. Hãy dùng tài khoản khách hàng.", "error");
        return;
    }

    try {
        await TPS.request("/api/GioHang/items", {
            method: "POST",
            body: JSON.stringify({ maSp, soLuong: 1 })
        });
        window.TPS?.showToast("Đã thêm sản phẩm vào giỏ hàng.", "success");
        await TPS.updateCartCount();
    } catch (error) {
        window.TPS?.showToast(`Không thể thêm vào giỏ hàng: ${error.message}`, "error");
    }
}

async function addToCartAndCheckout(maSp) {
    const user = TPS.getUser();
    if (!TPS.getToken()) {
        window.location.href = "../login/login.html";
        return;
    }

    if (user?.vaiTro !== "KhachHang") {
        window.TPS?.showToast("Tài khoản Admin không thực hiện mua hàng. Hãy dùng tài khoản khách hàng.", "error");
        return;
    }

    try {
        await TPS.request("/api/GioHang/items", {
            method: "POST",
            body: JSON.stringify({ maSp, soLuong: 1 })
        });
        await TPS.updateCartCount();
        window.location.href = "../cart/cart.html";
    } catch (error) {
        window.TPS?.showToast(`Không thể thêm vào giỏ hàng: ${error.message}`, "error");
    }
}

function openProductDetail(maSp) {
    window.location.href = `../product/product.html?id=${encodeURIComponent(maSp)}`;
}

applyPriceFilter?.addEventListener("click", fetchProducts);
clearFiltersBtn?.addEventListener("click", clearAllFilters);
sortSelect?.addEventListener("change", applyFilters);
originFilters?.addEventListener("change", applyFilters);

subcategoryFilters?.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-subcategory-filter]");
    if (!checkbox) return;

    const selected = getSelectedSubcategories();
    if (selected.length === 1) {
        maDanhMuc = selected[0];
        maDanhMucCha = getParentId(allCategories.find((item) => getCategoryId(item) === maDanhMuc));
    } else {
        maDanhMuc = "";
    }

    const url = new URL(window.location.href);
    if (maDanhMuc) {
        url.searchParams.set("maDanhMuc", maDanhMuc);
        url.searchParams.delete("maDanhMucCha");
    } else {
        url.searchParams.delete("maDanhMuc");
        if (maDanhMucCha) {
            url.searchParams.set("maDanhMucCha", maDanhMucCha);
        }
    }

    window.history.pushState({}, "", url);
    setPageTitle();
    fetchProducts();
});

document.addEventListener("submit", (event) => {
    if (event.target?.id === "header-search-form") {
        event.preventDefault();
        const keyword = document.getElementById("header-search-keyword")?.value.trim();
        const url = new URL(window.location.href);
        if (keyword) {
            url.searchParams.set("tuKhoa", keyword);
        } else {
            url.searchParams.delete("tuKhoa");
        }
        window.history.pushState({}, "", url);
        applyFilters();
    }
});

productGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-cart]");
    if (button) {
        event.stopPropagation();
        addToCart(button.dataset.addCart);
        return;
    }

    const checkoutButton = event.target.closest("[data-checkout]");
    if (checkoutButton) {
        event.stopPropagation();
        addToCartAndCheckout(checkoutButton.dataset.checkout);
        return;
    }

    const card = event.target.closest("[data-product-id]");
    if (card) {
        openProductDetail(card.dataset.productId);
    }
});

productGrid?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("button")) return;

    const card = event.target.closest("[data-product-id]");
    if (card) {
        event.preventDefault();
        openProductDetail(card.dataset.productId);
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("header-search-keyword");
    if (searchInput && initialKeyword) {
        searchInput.value = initialKeyword;
    }

    await loadCategories();
    await fetchProducts();
});
