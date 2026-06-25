(function () {
    const API_BASE_URLS = [
        localStorage.getItem("tps_api_base_url"),
        "http://localhost:5259",
        "http://127.0.0.1:5259",
        "http://localhost:59726",
        "http://127.0.0.1:59726",
        "https://localhost:7161",
        "https://localhost:44314"
    ].filter(Boolean);
    const AUTH_KEY = "tps_auth";
    const VI_TEXT_MAP = {
        "Rau cu sach": "Rau củ sạch",
        "Trai cay sach": "Trái cây sạch",
        "Thit - Ca sach": "Thịt - Cá sạch",
        "Ngu coc & Dau hat": "Ngũ cốc & Đậu hạt",
        "Thuc pham che bien": "Thực phẩm chế biến",
        "Ngu coc": "Ngũ cốc",
        "Rau cu": "Rau củ",
        "Sua cac loai": "Sữa các loại",
        "Thit": "Thịt",
        "Trai cay": "Trái cây",
        "Gao cac loai": "Gạo các loại",
        "Dau va hat": "Đậu & hạt",
        "Ngu coc an sang": "Ngũ cốc ăn sáng",
        "Rau an la": "Rau ăn lá",
        "Rau cu qua": "Rau củ quả",
        "Rau gia vi": "Rau gia vị",
        "Sua tuoi": "Sữa tươi",
        "Sua chua": "Sữa chua",
        "Sua hat": "Sữa hạt",
        "Thit heo va bo": "Thịt heo & bò",
        "Thit gia cam": "Thịt gia cầm",
        "Hai san": "Hải sản",
        "Trai cay Viet Nam": "Trái cây Việt Nam",
        "Trai cay nhap khau": "Trái cây nhập khẩu",
        "Trai cay theo mua": "Trái cây theo mùa",
        "Rau cai xanh huu co Da Lat": "Rau cải xanh hữu cơ Đà Lạt",
        "Ca chua bi VietGAP Da Lat": "Cà chua bi VietGAP Đà Lạt",
        "Khoai lang tim Nhat Ban": "Khoai lang tím Nhật Bản",
        "Tao Fuji Nhat Ban loai 1": "Táo Fuji Nhật Bản loại 1",
        "Viet quat tuoi Uc nhap khau": "Việt quất tươi Úc nhập khẩu",
        "Cam sach VietGAP Vinh": "Cam sạch VietGAP Vinh",
        "Thit bo Uc phi le nguyen mieng": "Thịt bò Úc phi lê nguyên miếng",
        "Thit lon sach chan thoa VietGAP": "Thịt lợn sạch chăn thả VietGAP",
        "Ca hoi Na Uy cat khuc tuoi": "Cá hồi Na Uy cắt khúc tươi",
        "Gao lut huyet rong huu co": "Gạo lứt huyết rồng hữu cơ",
        "Hat chia huu co Mexico": "Hạt chia hữu cơ Mexico",
        "Sua chua thuan chay Vinamilk Organic": "Sữa chua thuần chay Vinamilk Organic",
        "Viet Nam": "Việt Nam",
        "Nhat Ban": "Nhật Bản",
        "Uc": "Úc",
        "Bun 500g": "Bó 500g",
        "Hop 500g": "Hộp 500g",
        "Hop 125g": "Hộp 125g",
        "Hop 100g": "Hộp 100g",
        "Tui 1kg": "Túi 1kg",
        "Tui 200g": "Túi 200g",
        "Cho xac nhan": "Chờ xác nhận",
        "Da xac nhan": "Đã xác nhận",
        "Dang giao hang": "Đang giao hàng",
        "Da giao": "Đã giao",
        "Da huy": "Đã hủy",
        "Cho thanh toan": "Chờ thanh toán",
        "Thanh toan thanh cong": "Thanh toán thành công",
        "Thanh toan that bai": "Thanh toán thất bại",
        "Da hoan tien": "Đã hoàn tiền"
    };

    function getAuth() {
        try {
            return JSON.parse(sessionStorage.getItem(AUTH_KEY)) || null;
        } catch {
            return null;
        }
    }

    function saveAuth(auth) {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(normalizeAuth(auth)));
        applyAuthState();
    }

    function clearAuth() {
        sessionStorage.removeItem(AUTH_KEY);
        applyAuthState();
    }

    function getToken() {
        const auth = getAuth();
        return auth?.token || auth?.Token || null;
    }

    function getUser() {
        const auth = getAuth();
        return normalizeUser(auth?.user || auth?.User || null);
    }

    function unwrap(payload) {
        if (payload && Object.prototype.hasOwnProperty.call(payload, "data")) {
            return payload.data;
        }

        if (payload && Object.prototype.hasOwnProperty.call(payload, "Data")) {
            return payload.Data;
        }

        return payload;
    }

    async function request(path, options = {}) {
        const bases = getApiBaseCandidates();
        let lastNetworkError = null;

        for (const baseUrl of bases) {
            try {
                const payload = await requestOnce(baseUrl, path, options);
                localStorage.setItem("tps_api_base_url", baseUrl);
                return payload;
            } catch (error) {
                if (!isNetworkError(error)) {
                    throw error;
                }

                lastNetworkError = error;
            }
        }

        throw new Error(`Không kết nối được Backend. Hãy chạy API rồi thử lại. Các địa chỉ đã thử: ${bases.join(", ")}. Chi tiết: lỗi mạng hoặc CORS.`);
    }

    async function requestOnce(baseUrl, path, options = {}) {
        const headers = {
            "Accept": "application/json",
            ...(options.headers || {})
        };

        if (options.body && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        const token = getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers
        });

        const text = await response.text();
        let payload = null;

        try {
            payload = text ? JSON.parse(text) : null;
        } catch {
            payload = { message: text || `API trả về mã lỗi ${response.status}` };
        }

        if (!response.ok) {
            if (response.status === 401) {
                clearAuth();
                const message = payload?.message || payload?.Message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                throw new Error(message);
            }
            const message = payload?.message || payload?.Message || `API trả về mã lỗi ${response.status}`;
            throw new Error(message);
        }

        return payload;
    }

    function getApiBaseCandidates() {
        const saved = localStorage.getItem("tps_api_base_url");
        return [...new Set([saved, ...API_BASE_URLS].filter(Boolean))];
    }

    function isNetworkError(error) {
        return error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(error.message);
    }

    function normalizeAuth(auth) {
        const user = normalizeUser(auth?.user || auth?.User || null);
        return {
            token: auth?.token || auth?.Token || "",
            expiresAt: auth?.expiresAt || auth?.ExpiresAt || null,
            user
        };
    }

    function normalizeUser(user) {
        if (!user) {
            return null;
        }

        return {
            maNguoiDung: user.maNguoiDung || user.MaNguoiDung || "",
            tenDangNhap: user.tenDangNhap || user.TenDangNhap || "",
            vaiTro: user.vaiTro || user.VaiTro || "",
            maKh: user.maKh || user.MaKh || null,
            maAdmin: user.maAdmin || user.MaAdmin || null,
            hoTen: user.hoTen || user.HoTen || null
        };
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        }).format(Number(value || 0));
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function getField(source, ...keys) {
        for (const key of keys) {
            if (source && source[key] !== undefined && source[key] !== null) {
                return source[key];
            }
        }

        return "";
    }

    function viText(value) {
        return VI_TEXT_MAP[String(value ?? "")] || value || "";
    }

    function setStatus(element, message, type = "normal") {
        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.remove("is-hidden", "is-error", "is-success");

        if (type === "error") {
            element.classList.add("is-error");
        }

        if (type === "success") {
            element.classList.add("is-success");
        }
    }

    function hideStatus(element) {
        element?.classList.add("is-hidden");
    }

    function createToastContainer() {
        let container = document.getElementById("tps-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "tps-toast-container";
            Object.assign(container.style, {
                position: "fixed",
                top: "85px",
                right: "20px",
                zIndex: "9999",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                pointerEvents: "none"
            });
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(message, type = "info") {
        const container = createToastContainer();
        const toast = document.createElement("div");

        const colors = {
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FF9800",
            error: "#F44336"
        };

        Object.assign(toast.style, {
            background: colors[type] || colors.info,
            color: "white",
            padding: "15px 25px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            opacity: "0",
            transform: "translateX(100%)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
            pointerEvents: "auto",
            cursor: "pointer"
        });

        toast.textContent = message;

        // Cick to dismiss
        toast.onclick = () => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        };

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(0)";
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = "0";
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    async function applyAuthState() {
        // Tự động load Header/Footer nếu thẻ trống
        const headerEl = document.querySelector('header.site-header');
        const footerEl = document.querySelector('footer.simple-footer');

        // Lấy đường dẫn tuyệt đối của thư mục common từ thẻ script
        let commonDir = "common";
        const scripts = document.getElementsByTagName("script");
        for (let s of scripts) {
            if (s.src && s.src.includes("/common/api.js")) {
                commonDir = s.src.substring(0, s.src.lastIndexOf("/"));
                break;
            }
        }

        // Xác định tiền tố đường dẫn (nếu đang ở trang con thì thêm ../)
        const prefix = getHomePath().replace("index.html", "");

        if (headerEl && headerEl.innerHTML.trim() === "") {
            try {
                const res = await fetch(`${commonDir}/header.html`);
                if (res.ok) {
                                        headerEl.innerHTML = await res.text();

                    // Rewrite URLs for subdirectories
                    if (prefix) {
                        headerEl.querySelectorAll("a[href]").forEach(link => {
                            let href = link.getAttribute("href");
                            if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("javascript:")) {
                                link.setAttribute("href", prefix + href);
                            }
                            
                            // Ngăn reload trang nếu click vào link đang ở trang hiện tại
                            link.addEventListener("click", (e) => {
                                if (link.href) {
                                    const url = new URL(link.href, window.location.origin);
                                    if (url.pathname === window.location.pathname && url.search === window.location.search) {
                                        e.preventDefault();
                                    }
                                }
                            });
                        });
                        headerEl.querySelectorAll("form[action]").forEach(form => {
                            let action = form.getAttribute("action");
                            if (action && !action.startsWith("http")) {
                                form.setAttribute("action", prefix + action);
                            }
                        });
                        headerEl.querySelectorAll("img[src]").forEach(img => {
                            let src = img.getAttribute("src");
                            if (src && !src.startsWith("http") && !src.startsWith("data:")) {
                                img.setAttribute("src", prefix + src);
                            }
                        });
                    } else {
                        // Nếu không có prefix, vẫn cần ngăn reload
                        headerEl.querySelectorAll("a[href]").forEach(link => {
                            link.addEventListener("click", (e) => {
                                if (link.href) {
                                    const url = new URL(link.href, window.location.origin);
                                    if (url.pathname === window.location.pathname && url.search === window.location.search) {
                                        e.preventDefault();
                                    }
                                }
                            });
                        });
                    }
                    // Sau khi inject HTML, gọi lại hàm khởi tạo hiệu ứng hover
                    if (window.initGooEffects) window.initGooEffects();
                    
                    // Populate search keyword from URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const tuKhoa = urlParams.get("tuKhoa");
                    if (tuKhoa) {
                        const searchInput = document.getElementById("header-search-keyword");
                        if (searchInput) searchInput.value = tuKhoa;
                    }

                    // Cập nhật số lượng giỏ hàng sau khi header được load
                    await updateCartCount();

                    // Khởi tạo lại category menu sau khi header đã có trong DOM
                    if (window.TPSCategoryMenu) {
                        window.TPSCategoryMenu.refresh();
                    }
                } else {
                    console.warn("Không tìm thấy file header.html tại:", `${prefix}common/header.html`);
                }
            } catch (err) {
                console.error("Lỗi fetch Header. Nếu bạn thấy lỗi CORS, hãy dùng Live Server:", err);
            }
        } else if (headerEl) {
            // Nếu header đã có nội dung, vẫn cập nhật cart count
            await updateCartCount();
        }

        if (footerEl && footerEl.innerHTML.trim() === "") {
            try {
                const res = await fetch(`${commonDir}/footer.html`);
                                if (res.ok) {
                    footerEl.innerHTML = await res.text();
                    
                    // Rewrite URLs for subdirectories
                    if (prefix) {
                        footerEl.querySelectorAll("a[href]").forEach(link => {
                            let href = link.getAttribute("href");
                            if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("javascript:")) {
                                link.setAttribute("href", prefix + href);
                            }
                        });
                        footerEl.querySelectorAll("img[src]").forEach(img => {
                            let src = img.getAttribute("src");
                            if (src && !src.startsWith("http") && !src.startsWith("data:")) {
                                img.setAttribute("src", prefix + src);
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Lỗi fetch Footer:", err);
            }
        }

        const user = getUser();
        document.body.classList.toggle("is-authenticated", Boolean(user));
        document.body.classList.toggle("is-guest", !user);
        
        // Set user role attribute for CSS-based visibility control
        if (user) {
            document.body.setAttribute("data-user-role", user.vaiTro);
        } else {
            document.body.removeAttribute("data-user-role");
        }

        // Re-query các element sau khi đã inject HTML vào DOM
        document.querySelectorAll("[data-user-name]").forEach((node) => {
            if (user) {
                node.textContent = "Xin chào, " + (user.hoTen || user.tenDangNhap || "Tài khoản");
            } else {
                node.textContent = "Tài khoản";
            }
        });

        document.querySelectorAll("[data-admin-link]").forEach((node) => {
            node.style.display = user?.vaiTro === "Admin" ? "" : "none";
        });

        document.querySelectorAll("[data-customer-link]").forEach((node) => {
            node.style.display = !user || user.vaiTro === "KhachHang" ? "" : "none";
        });

        document.querySelectorAll("[data-logout]").forEach((node) => {
            node.addEventListener("click", () => {
                clearAuth();
                window.location.href = getHomePath();
            }, { once: true });
        });

        // Cập nhật số lượng giỏ hàng sau khi auth state được áp dụng
        setTimeout(async () => {
            await updateCartCount();
        }, 100);
    }

    function requireRole(role) {
        const user = getUser();
        if (!user || user.vaiTro !== role) {
            window.location.href = getLoginPath();
            return false;
        }

        return true;
    }

    function getHomePath() {
        const path = window.location.pathname.replace(/\\/g, "/");
        if (path.match(/\/(cart|login|register|orders|product|admin|category)\//)) {
            return "../index.html";
        }
        return "index.html";
    }

    function getLoginPath() {
        const path = window.location.pathname.replace(/\\/g, "/");
        if (path.match(/\/(cart|login|register|orders|product|admin|category)\//)) {
            return "../login/login.html";
        }
        return "login/login.html";
    }

    const fallbackImages = [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80"
    ];

    function getProductImage(maSp, hinhAnh) {
        if (hinhAnh && hinhAnh.trim() !== "") return hinhAnh;
        const num = parseInt((maSp || "").replace(/\D/g, ""), 10) || 0;
        return fallbackImages[num % fallbackImages.length];
    }

    async function updateCartCount(retryCount = 0) {
        const cartCountElements = document.querySelectorAll("[data-cart-count]");
        
        // Nếu không tìm thấy element và chưa retry quá nhiều lần, thử lại sau
        if (cartCountElements.length === 0 && retryCount < 5) {
            setTimeout(() => updateCartCount(retryCount + 1), 200);
            return;
        }
        
        if (!TPS.getToken()) {
            cartCountElements.forEach(el => el.textContent = "0");
            return;
        }

        // Check if user has KhachHang role before calling cart API
        const auth = TPS.getAuth();
        if (!auth || !auth.user || auth.user.vaiTro !== "KhachHang") {
            cartCountElements.forEach(el => el.textContent = "0");
            return;
        }

        try {
            const payload = await TPS.request("/api/GioHang");
            const cartData = TPS.unwrap(payload) || {};
            
            // API returns object with items property
            const cartItems = cartData.items || [];
            
            // Ensure cartItems is an array
            if (!Array.isArray(cartItems)) {
                console.warn("Cart items is not an array:", cartItems);
                cartCountElements.forEach(el => el.textContent = "0");
                return;
            }
            
            const totalItems = cartItems.reduce((sum, item) => {
                const soLuong = TPS.getField(item, "soLuong", "SoLuong");
                return sum + (parseInt(soLuong) || 0);
            }, 0);
            
            cartCountElements.forEach(el => el.textContent = totalItems.toString());
        } catch (error) {
            // Handle 403 Forbidden - user doesn't have KhachHang role (e.g., Admin)
            if (error.message && error.message.includes("403")) {
                cartCountElements.forEach(el => el.textContent = "0");
                return;
            }
            console.error("Failed to fetch cart count:", error);
            cartCountElements.forEach(el => el.textContent = "0");
        }
    }

    function buildCategoryTree(categories) {
        const list = Array.isArray(categories) ? categories : [];
        const roots = list
            .filter((item) => !getField(item, "maDanhMucCha", "MaDanhMucCha"))
            .sort((a, b) => viText(getField(a, "tenDanhMuc", "TenDanhMuc")).localeCompare(
                viText(getField(b, "tenDanhMuc", "TenDanhMuc")), "vi"
            ));

        return roots.map((root) => {
            const rootId = getField(root, "maDanhMuc", "MaDanhMuc");
            const children = list
                .filter((item) => getField(item, "maDanhMucCha", "MaDanhMucCha") === rootId)
                .sort((a, b) => viText(getField(a, "tenDanhMuc", "TenDanhMuc")).localeCompare(
                    viText(getField(b, "tenDanhMuc", "TenDanhMuc")), "vi"
                ));

            return { root, children };
        });
    }

    function getCategoryChildren(categories, parentId) {
        return (Array.isArray(categories) ? categories : [])
            .filter((item) => getField(item, "maDanhMucCha", "MaDanhMucCha") === parentId);
    }

    function getCategoryRoots(categories) {
        return (Array.isArray(categories) ? categories : [])
            .filter((item) => !getField(item, "maDanhMucCha", "MaDanhMucCha"));
    }

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

    function formatProductCategory(product, categories = []) {
        const maDanhMuc = getField(product, "maDanhMuc", "MaDanhMuc");
        const childName = viText(getField(product, "tenDanhMuc", "TenDanhMuc")) || "Thực phẩm sạch";
        let maDanhMucCha = getField(product, "maDanhMucCha", "MaDanhMucCha");
        let parentName = viText(getField(product, "tenDanhMucCha", "TenDanhMucCha"));

        if (!parentName && categories.length && maDanhMuc) {
            const child = categories.find((item) => getField(item, "maDanhMuc", "MaDanhMuc") === maDanhMuc);
            maDanhMucCha = getField(child, "maDanhMucCha", "MaDanhMucCha");
            const parent = categories.find((item) => getField(item, "maDanhMuc", "MaDanhMuc") === maDanhMucCha);
            parentName = viText(getField(parent, "tenDanhMuc", "TenDanhMuc"));
        }

        const categoryPath = getCategoryPagePath();
        const categoryUrl = maDanhMuc
            ? `${categoryPath}?maDanhMuc=${encodeURIComponent(maDanhMuc)}`
            : maDanhMucCha
                ? `${categoryPath}?maDanhMucCha=${encodeURIComponent(maDanhMucCha)}`
                : categoryPath;

        return {
            maDanhMuc,
            maDanhMucCha,
            parentName,
            childName,
            categoryUrl
        };
    }

    function renderCategoryChipHtml(product, categories = []) {
        const info = formatProductCategory(product, categories);

        if (info.parentName && info.childName) {
            return `
                <a class="category-chip" href="${escapeHtml(info.categoryUrl)}" onclick="event.stopPropagation()" title="${escapeHtml(`${info.parentName} › ${info.childName}`)}">
                    <span class="category-chip-parent"><i class="ti ti-tag" style="font-size: 16px; color: gray;"></i> ${escapeHtml(info.parentName)}</span>
                    <span class="category-chip-sep">›</span>
                    <span class="category-chip-child">${escapeHtml(info.childName)}</span>
                </a>
            `;
        }

        return `
            <a class="category-chip" href="${escapeHtml(info.categoryUrl)}" onclick="event.stopPropagation()">
                #${escapeHtml(info.childName)}
            </a>
        `;
    }

    window.TPS = {
        API_BASE_URLS,
        getApiBaseCandidates,
        request,
        unwrap,
        getAuth,
        saveAuth,
        clearAuth,
        getToken,
        getUser,
        requireRole,
        formatCurrency,
        escapeHtml,
        getField,
        viText,
        setStatus,
        hideStatus,
        showToast,
        applyAuthState,
        getProductImage,
        updateCartCount,
        buildCategoryTree,
        getCategoryChildren,
        getCategoryRoots,
        getCategoryPagePath,
        formatProductCategory,
        renderCategoryChipHtml
    };

    document.addEventListener("DOMContentLoaded", applyAuthState);
})();
