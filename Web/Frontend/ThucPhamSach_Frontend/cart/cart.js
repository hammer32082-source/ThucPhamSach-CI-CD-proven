const cartStatus = document.getElementById("cart-status");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");
const checkoutForm = document.getElementById("checkout-form");

function getItems(cart) {
    return TPS.getField(cart, "items", "Items") || [];
}

function renderCart(cart) {
    const items = getItems(cart);
    const total = TPS.getField(cart, "tongTien", "TongTien") || 0;
    cartTotal.textContent = TPS.formatCurrency(total);

    if (!items.length) {
        cartList.innerHTML = "";
        TPS.setStatus(cartStatus, "Giỏ hàng đang trống.");
        return;
    }

    TPS.hideStatus(cartStatus);
    cartList.innerHTML = items.map((item) => {
        const maSp = TPS.getField(item, "maSp", "MaSp");
        const tenSp = TPS.viText(TPS.getField(item, "tenSp", "TenSp"));
        const hinhAnh = TPS.getProductImage(maSp, TPS.getField(item, "hinhAnh", "HinhAnh"));
        const donGia = TPS.getField(item, "donGia", "DonGia");
        const soLuong = TPS.getField(item, "soLuong", "SoLuong");
        const thanhTien = TPS.getField(item, "thanhTien", "ThanhTien");
        const soLuongTon = TPS.getField(item, "soLuongTon", "SoLuongTon");

        return `
            <article class="cart-item" data-product-id="${TPS.escapeHtml(maSp)}">
                <img src="${TPS.escapeHtml(hinhAnh)}" alt="${TPS.escapeHtml(tenSp)}" loading="lazy">
                <div>
                    <h3>${TPS.escapeHtml(tenSp)}</h3>
                    <p>${TPS.formatCurrency(donGia)} · Tồn ${TPS.escapeHtml(soLuongTon)}</p>
                    <p class="line-total">${TPS.formatCurrency(thanhTien)}</p>
                </div>
                <div class="cart-actions">
                    <label class="quantity-control">
                        <span>SL</span>
                        <input type="number" min="1" value="${TPS.escapeHtml(soLuong)}" data-quantity="${TPS.escapeHtml(maSp)}">
                    </label>
                    <button class="danger-button" type="button" data-remove="${TPS.escapeHtml(maSp)}">Xóa</button>
                </div>
            </article>
        `;
    }).join("");
}

async function fetchCart() {
    if (!TPS.requireRole("KhachHang")) {
        return;
    }

    try {
        TPS.setStatus(cartStatus, "Đang tải giỏ hàng...");
        const payload = await TPS.request("/api/GioHang");
        renderCart(TPS.unwrap(payload));
    } catch (error) {
        TPS.setStatus(cartStatus, error.message, "error");
    }
}

async function updateQuantity(maSp, soLuong) {
    try {
        const payload = await TPS.request(`/api/GioHang/items/${encodeURIComponent(maSp)}`, {
            method: "PUT",
            body: JSON.stringify({ soLuong })
        });
        renderCart(TPS.unwrap(payload));
        TPS.setStatus(cartStatus, "Đã cập nhật giỏ hàng.", "success");
    } catch (error) {
        TPS.setStatus(cartStatus, error.message, "error");
    }
}

async function removeItem(maSp) {
    try {
        const payload = await TPS.request(`/api/GioHang/items/${encodeURIComponent(maSp)}`, {
            method: "DELETE"
        });
        renderCart(TPS.unwrap(payload));
        TPS.setStatus(cartStatus, "Đã xóa sản phẩm.", "success");
    } catch (error) {
        TPS.setStatus(cartStatus, error.message, "error");
    }
}

cartList?.addEventListener("change", (event) => {
    const input = event.target.closest("[data-quantity]");
    if (!input) {
        return;
    }

    const quantity = Number(input.value);
    if (quantity > 0) {
        updateQuantity(input.dataset.quantity, quantity);
    }
});

cartList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (button) {
        removeItem(button.dataset.remove);
    }
});

clearCartButton?.addEventListener("click", async () => {
    try {
        const payload = await TPS.request("/api/GioHang/clear", { method: "DELETE" });
        renderCart(TPS.unwrap(payload));
        TPS.setStatus(cartStatus, "Đã xóa toàn bộ giỏ hàng.", "success");
    } catch (error) {
        TPS.setStatus(cartStatus, error.message, "error");
    }
});

checkoutForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(checkoutForm);
    const payload = {
        diaChiGiao: formData.get("diaChiGiao")?.toString().trim() || null,
        phuongThucThanhToan: formData.get("phuongThucThanhToan")?.toString()
    };

    try {
        TPS.setStatus(cartStatus, "Đang tạo đơn hàng...");
        await TPS.request("/api/DonHang", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        TPS.setStatus(cartStatus, "Đặt hàng thành công.", "success");
        checkoutForm.reset();
        await fetchCart();

        // Hiện alert dialog và chuyển hướng sang trang đơn hàng
        alert("Đặt hàng thành công! Đang chuyển sang trang đơn hàng...");
        window.location.href = "../orders/orders.html";
    } catch (error) {
        TPS.setStatus(cartStatus, error.message, "error");
    }
});

document.addEventListener("DOMContentLoaded", fetchCart);
