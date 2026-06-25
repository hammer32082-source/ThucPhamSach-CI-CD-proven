const detailStatus = document.getElementById("product-detail-status");
const detail = document.getElementById("product-detail");
const quantityInput = document.getElementById("product-quantity");

let currentProduct = null;

function getProductId() {
    return new URLSearchParams(window.location.search).get("id")?.trim() || "";
}

function formatExpiry(value) {
    if (!value) {
        return "Đang cập nhật";
    }

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function renderProduct(product) {
    const maSp = TPS.getField(product, "maSp", "MaSp");
    const tenSp = TPS.viText(TPS.getField(product, "tenSp", "TenSp"));
    const stock = Number(TPS.getField(product, "soLuongTon", "SoLuongTon") || 0);
    const image = TPS.getProductImage(maSp, TPS.getField(product, "hinhAnh", "HinhAnh"));
    const categoryInfo = TPS.formatProductCategory(product);
    const categoryLabel = categoryInfo.parentName && categoryInfo.childName
        ? `${categoryInfo.parentName} › ${categoryInfo.childName}`
        : categoryInfo.childName;
    const description = TPS.getField(product, "moTa", "MoTa")
        || "Sản phẩm tươi sạch, có nguồn gốc rõ ràng và được chọn lọc kỹ trước khi giao đến khách hàng.";

    document.title = `${tenSp} - Thực và vị`;
    document.getElementById("product-detail-image").src = image;
    document.getElementById("product-detail-image").alt = tenSp;
    document.getElementById("product-detail-category").textContent = categoryLabel;
    document.getElementById("product-detail-category-info").textContent = categoryLabel;
    document.getElementById("product-detail-name").textContent = tenSp;
    document.getElementById("product-detail-price").textContent =
        TPS.formatCurrency(TPS.getField(product, "gia", "Gia"));
    document.getElementById("product-detail-id").textContent = maSp;
    document.getElementById("product-detail-unit").textContent =
        TPS.viText(TPS.getField(product, "donViTinh", "DonViTinh")) || "Đang cập nhật";
    document.getElementById("product-detail-origin").textContent =
        TPS.viText(TPS.getField(product, "nguonGoc", "NguonGoc")) || "Đang cập nhật";
    document.getElementById("product-detail-stock").textContent = `${stock} sản phẩm`;
    document.getElementById("product-detail-expiry").textContent =
        formatExpiry(TPS.getField(product, "hanSuDung", "HanSuDung"));
    document.getElementById("product-detail-description").textContent = description;

    quantityInput.max = Math.max(stock, 1).toString();
    quantityInput.disabled = stock <= 0;
    document.getElementById("add-product-to-cart").disabled = stock <= 0;
    document.getElementById("buy-product-now").disabled = stock <= 0;

    TPS.hideStatus(detailStatus);
    detail.classList.remove("is-hidden");
}

async function loadProduct() {
    const maSp = getProductId();
    if (!maSp) {
        TPS.setStatus(detailStatus, "Không tìm thấy mã sản phẩm.", "error");
        return;
    }

    try {
        const payload = await TPS.request(`/api/SanPham/${encodeURIComponent(maSp)}?v=${Date.now()}`);
        currentProduct = TPS.unwrap(payload);
        renderProduct(currentProduct);
    } catch (error) {
        TPS.setStatus(detailStatus, error.message, "error");
    }
}

async function addCurrentProductToCart(redirectToCart = false) {
    if (!TPS.getToken()) {
        window.location.href = "../login/login.html";
        return;
    }

    if (TPS.getUser()?.vaiTro !== "KhachHang") {
        TPS.showToast("Tài khoản Admin không thể mua hàng.", "error");
        return;
    }

    const quantity = Math.max(1, Number(quantityInput.value) || 1);
    const stock = Number(TPS.getField(currentProduct, "soLuongTon", "SoLuongTon") || 0);
    if (quantity > stock) {
        TPS.showToast(`Sản phẩm chỉ còn ${stock} trong kho.`, "warning");
        return;
    }

    try {
        await TPS.request("/api/GioHang/items", {
            method: "POST",
            body: JSON.stringify({
                maSp: TPS.getField(currentProduct, "maSp", "MaSp"),
                soLuong: quantity
            })
        });
        await TPS.updateCartCount();

        if (redirectToCart) {
            window.location.href = "../cart/cart.html";
            return;
        }

        TPS.showToast("Đã thêm sản phẩm vào giỏ hàng.", "success");
    } catch (error) {
        TPS.showToast(error.message, "error");
    }
}

document.getElementById("add-product-to-cart")?.addEventListener("click", () => {
    addCurrentProductToCart(false);
});

document.getElementById("buy-product-now")?.addEventListener("click", () => {
    addCurrentProductToCart(true);
});

document.addEventListener("DOMContentLoaded", loadProduct);
