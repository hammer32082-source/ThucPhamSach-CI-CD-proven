const productList = document.getElementById("product-list");
const productStatus = document.getElementById("product-status");
const recommendationsContainer = document.getElementById("recommendations");
const recommendationStatus = document.getElementById("recommendation-status");

let categoryCache = [];
let sliderTimers = new Map();

function smoothScrollHorizontal(element, distance, duration) {
    const start = element.scrollLeft;
    const startTime = performance.now();

    function animation(currentTime) {
        let timeElapsed = currentTime - startTime;
        let progress = timeElapsed / duration;
        
        if (progress > 1) progress = 1;
        
        // Easing function: easeInOutCubic
        const ease = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        element.scrollLeft = start + distance * ease;

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

function startSliderTimer(track) {
    if (sliderTimers.has(track)) clearInterval(sliderTimers.get(track));
    
    const timer = setInterval(() => {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            smoothScrollHorizontal(track, -track.scrollLeft, 800); // Cuộn về đầu chậm 800ms
        } else {
            const firstCard = track.querySelector('.product-card');
            const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 274;
            smoothScrollHorizontal(track, scrollAmount, 600); // Lướt chậm 600ms
        }
    }, 4000); // Đổi thành 4 giây
    
    sliderTimers.set(track, timer);
}

function stopSliderTimer(track) {
    if (sliderTimers.has(track)) {
        clearInterval(sliderTimers.get(track));
    }
}

// Event delegation for slider buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.slider-btn');
    if (!btn) return;
    
    const targetId = btn.getAttribute('data-target');
    const track = document.querySelector(targetId);
    if (!track) return;
    
    const firstCard = track.querySelector('.product-card');
    const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 274;
    
    if (btn.classList.contains('prev')) {
        if (track.scrollLeft <= 0) {
            smoothScrollHorizontal(track, track.scrollWidth, 800);
        } else {
            smoothScrollHorizontal(track, -scrollAmount, 600);
        }
    } else {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            smoothScrollHorizontal(track, -track.scrollLeft, 800);
        } else {
            smoothScrollHorizontal(track, scrollAmount, 600);
        }
    }
    
    startSliderTimer(track); // Reset timer
});

// Event delegation for pause on hover
document.addEventListener('mouseenter', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('product-slider-track')) {
        stopSliderTimer(e.target);
    }
}, true);

document.addEventListener('mouseleave', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('product-slider-track')) {
        startSliderTimer(e.target);
    }
}, true);

function buildProductQuery() {
    const params = new URLSearchParams();
    const keyword = document.getElementById("header-search-keyword")?.value.trim()
                  ?? new URLSearchParams(window.location.search).get("tuKhoa")
                  ?? "";

    if (keyword) params.set("tuKhoa", keyword);

    const query = params.toString();
    return query ? `/api/SanPham?${query}` : "/api/SanPham";
}

function renderProducts(products) {
    if (!products.length) {
        productList.innerHTML = "";
        TPS.setStatus(productStatus, "Chưa có sản phẩm phù hợp.");
        return;
    }

    TPS.hideStatus(productStatus);

    productList.innerHTML = products.map((product, index) => {
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
                        ${TPS.renderCategoryChipHtml(product, categoryCache)}
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

async function fetchProducts() {
    try {
        TPS.setStatus(productStatus, "Đang tải sản phẩm...");
        productList.innerHTML = "";
        const payload = await TPS.request(buildProductQuery());
        renderProducts(TPS.unwrap(payload) || []);
    } catch (error) {
        productList.innerHTML = "";
        TPS.setStatus(productStatus, `Không thể tải sản phẩm. Chi tiết: ${error.message}`, "error");
    }
}

async function addToCart(maSp) {
    const user = TPS.getUser();
    if (!TPS.getToken()) {
        window.location.href = "login/login.html";
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
        window.location.href = "login/login.html";
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
        window.location.href = "cart/cart.html";
    } catch (error) {
        window.TPS?.showToast(`Không thể thêm vào giỏ hàng: ${error.message}`, "error");
    }
}

// Event delegation for the header search form
document.addEventListener("submit", (event) => {
    if (event.target && event.target.id === "header-search-form") {
        event.preventDefault();
        
        // Update URL to reflect the search without reloading
        const keyword = document.getElementById("header-search-keyword")?.value.trim();
        const url = new URL(window.location);
        if (keyword) {
            url.searchParams.set("tuKhoa", keyword);
        } else {
            url.searchParams.delete("tuKhoa");
        }
        window.history.pushState({}, "", url);
        
        fetchProducts();
        
        // Scroll to products if the section exists
        const productSection = document.querySelector(".product-section");
        if (productSection) {
            const offsetTop = productSection.offsetTop - 80;
            smoothScrollTo(offsetTop, 800);
        }
    }
});

productList?.addEventListener("click", (event) => {
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

recommendationsContainer?.addEventListener("click", (event) => {
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

function openProductDetail(maSp) {
    window.location.href = `product/product.html?id=${encodeURIComponent(maSp)}`;
}

function handleProductCardKeyboard(event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    if (event.target.closest("button")) {
        return;
    }

    const card = event.target.closest("[data-product-id]");
    if (card) {
        event.preventDefault();
        openProductDetail(card.dataset.productId);
    }
}

productList?.addEventListener("keydown", handleProductCardKeyboard);
recommendationsContainer?.addEventListener("keydown", handleProductCardKeyboard);

async function fetchRecommendations() {
    const user = TPS.getUser();
    
    // Hide recommendation section if user is not logged in or is not a customer
    if (!TPS.getToken() || user?.vaiTro !== "KhachHang") {
        const recommendationSection = document.getElementById("recommendations");
        if (recommendationSection) {
            recommendationSection.style.display = "none";
        }
        return;
    }

    try {
        TPS.setStatus(recommendationStatus, "Đang tải gợi ý...");
        document.getElementById("list-history").innerHTML = "";
        document.getElementById("list-behavior").innerHTML = "";
        document.getElementById("list-category").innerHTML = "";
        document.getElementById("list-fallback").innerHTML = "";
        
        const payload = await TPS.request("/api/GoiY/khach-hang");
        renderRecommendationsAll(TPS.unwrap(payload) || {});
    } catch (error) {
        document.getElementById("list-history").innerHTML = "";
        document.getElementById("list-behavior").innerHTML = "";
        document.getElementById("list-category").innerHTML = "";
        document.getElementById("list-fallback").innerHTML = "";
        TPS.setStatus(recommendationStatus, `Không thể tải gợi ý: ${error.message}`, "error");
    }
}

function renderRecommendationsAll(data) {
    // Dừng tất cả timer cũ
    document.querySelectorAll('.product-slider-track').forEach(stopSliderTimer);

    const history = data.lichSuMuaHang || [];
    const behavior = data.hanhViMuaSam || [];
    const category = data.theoDanhMuc || [];
    const fallback = data.fallback || [];

    let hasAnyData = false;

    if (history.length > 0) {
        document.getElementById("section-history").style.display = "block";
        const track = document.getElementById("list-history");
        track.innerHTML = getProductsHtml(history);
        startSliderTimer(track);
        hasAnyData = true;
    } else {
        document.getElementById("section-history").style.display = "none";
    }

    if (behavior.length > 0) {
        document.getElementById("section-behavior").style.display = "block";
        const track = document.getElementById("list-behavior");
        track.innerHTML = getProductsHtml(behavior);
        startSliderTimer(track);
        hasAnyData = true;
    } else {
        document.getElementById("section-behavior").style.display = "none";
    }

    if (category.length > 0) {
        document.getElementById("section-category").style.display = "block";
        const track = document.getElementById("list-category");
        track.innerHTML = getProductsHtml(category);
        startSliderTimer(track);
        hasAnyData = true;
    } else {
        document.getElementById("section-category").style.display = "none";
    }

    if (!hasAnyData && fallback.length > 0) {
        document.getElementById("section-fallback").style.display = "block";
        const track = document.getElementById("list-fallback");
        track.innerHTML = getProductsHtml(fallback);
        startSliderTimer(track);
        hasAnyData = true;
    } else {
        document.getElementById("section-fallback").style.display = "none";
    }

    if (!hasAnyData) {
        TPS.setStatus(recommendationStatus, "Chưa có gợi ý nào cho bạn. Hãy mua sắm để nhận gợi ý phù hợp!");
    } else {
        TPS.hideStatus(recommendationStatus);
    }
}

function getProductsHtml(recommendations) {
    if (!recommendations || !recommendations.length) return "";
    return recommendations.map((product) => {
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
                        ${TPS.renderCategoryChipHtml(product, categoryCache)}
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

function smoothScrollTo(targetPosition, duration = 800) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smoother animation
        const easeInOutQuad = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutQuad);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

function initScrollEffects() {
    // Cuộn mượt cho nút Xem sản phẩm (secondary-link)
    const viewProductsBtn = document.querySelector(".secondary-link");
    if (viewProductsBtn) {
        viewProductsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const productSection = document.querySelector(".product-section");
            if (productSection) {
                const offsetTop = productSection.offsetTop - 80; // Offset for header
                smoothScrollTo(offsetTop, 800);
            }
        });
    }

    // Cuộn mượt cho link "Sản phẩm" trong navigation
    const productsLink = document.querySelector('a[href="#products"]');
    if (productsLink) {
        productsLink.addEventListener("click", (e) => {
            e.preventDefault();
            const productSection = document.querySelector(".product-section");
            if (productSection) {
                const offsetTop = productSection.offsetTop - 80; // Offset for header
                smoothScrollTo(offsetTop, 800);
            }
        });
    }

    // Nút Back to Top
    const backToTopBtn = document.createElement("button");
    backToTopBtn.className = "back-to-top";
    backToTopBtn.innerHTML = "↑";
    backToTopBtn.setAttribute("title", "Lên đầu trang");
    backToTopBtn.setAttribute("aria-label", "Lên đầu trang");
    document.body.appendChild(backToTopBtn);

    let isScrolling = false;
    window.addEventListener("scroll", () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 500) {
                    backToTopBtn.classList.add("is-visible");
                } else {
                    backToTopBtn.classList.remove("is-visible");
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    backToTopBtn.addEventListener("click", () => {
        smoothScrollTo(0, 800);
    });
}

function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    const prevBtn = document.getElementById("hero-prev");
    const nextBtn = document.getElementById("hero-next");
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let autoPlayTimer = null;
    const INTERVAL = 5000;

    function goToSlide(index) {
        slides[currentSlide].classList.remove("active");
        dots[currentSlide]?.classList.remove("active");
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add("active");
        dots[currentSlide]?.classList.add("active");
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(nextSlide, INTERVAL);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    // Arrow buttons
    nextBtn?.addEventListener("click", () => {
        nextSlide();
        startAutoPlay();
    });

    prevBtn?.addEventListener("click", () => {
        prevSlide();
        startAutoPlay();
    });

    // Dot buttons
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            goToSlide(parseInt(dot.dataset.slide));
            startAutoPlay();
        });
    });

    // Pause on hover
    const heroSection = document.querySelector(".hero");
    heroSection?.addEventListener("mouseenter", stopAutoPlay);
    heroSection?.addEventListener("mouseleave", startAutoPlay);

    // Start auto-play
    startAutoPlay();
}

async function loadCategories() {
    try {
        const payload = await TPS.request("/api/DanhMuc");
        categoryCache = TPS.unwrap(payload) || [];
    } catch {
        categoryCache = [];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    initHeroSlider();
    await loadCategories();
    await fetchProducts();
    await fetchRecommendations();
    initScrollEffects();
});
