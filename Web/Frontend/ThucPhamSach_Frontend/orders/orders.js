const ordersStatus = document.getElementById("orders-status");
const ordersList = document.getElementById("orders-list");

function getStatusClass(trangThai) {
    const status = trangThai.toLowerCase();
    if (status.includes("cho xac nhan") || status.includes("chờ xác nhận")) {
        return "status-pending";
    }
    if (status.includes("da xac nhan") || status.includes("đã xác nhận")) {
        return "status-confirmed";
    }
    if (status.includes("da giao") || status.includes("đã giao")) {
        return "status-delivered";
    }
    if (status.includes("da huy") || status.includes("đã hủy")) {
        return "status-cancelled";
    }
    return "";
}

function renderOrders(orders) {
    if (!orders.length) {
        ordersList.innerHTML = "";
        TPS.setStatus(ordersStatus, "Bạn chưa có đơn hàng nào.");
        return;
    }

    TPS.hideStatus(ordersStatus);
    ordersList.innerHTML = orders.map((order) => {
        const maDonHang = TPS.getField(order, "maDonHang", "MaDonHang");
        const ngayDat = new Date(TPS.getField(order, "ngayDat", "NgayDat")).toLocaleString("vi-VN");
        const trangThai = TPS.viText(TPS.getField(order, "trangThaiDonHang", "TrangThaiDonHang"));
        const trangThaiRaw = TPS.getField(order, "trangThaiDonHang", "TrangThaiDonHang");
        const tongTien = TPS.getField(order, "tongTien", "TongTien");
        const diaChi = TPS.getField(order, "diaChiGiao", "DiaChiGiao") || "Chưa có địa chỉ";
        const items = TPS.getField(order, "items", "Items") || [];
        const statusClass = getStatusClass(trangThaiRaw);
        const canCancel = trangThaiRaw === "Cho xac nhan";

        return `
            <article class="order-card">
                <div class="order-head">
                    <div>
                        <h2>${TPS.escapeHtml(maDonHang)}</h2>
                        <span>${TPS.escapeHtml(ngayDat)}</span>
                    </div>
                    <span class="status-pill ${TPS.escapeHtml(statusClass)}">${TPS.escapeHtml(trangThai)}</span>
                </div>
                <ul class="order-items">
                    ${items.map((item) => {
                        const maSp = TPS.getField(item, "maSp", "MaSp");
                        const hinhAnh = TPS.getProductImage(maSp, TPS.getField(item, "hinhAnh", "HinhAnh"));
                        const hinhAnhHtml = `<img src="${TPS.escapeHtml(hinhAnh)}" alt="${TPS.escapeHtml(TPS.viText(TPS.getField(item, "tenSp", "TenSp")))}" class="order-item-img">`;

                        return `
                        <li>
                            <div class="order-item-info">
                                ${hinhAnhHtml}
                                <span>${TPS.escapeHtml(TPS.viText(TPS.getField(item, "tenSp", "TenSp")))} x ${TPS.escapeHtml(TPS.getField(item, "soLuong", "SoLuong"))}</span>
                            </div>
                            <strong>${TPS.formatCurrency(TPS.getField(item, "thanhTien", "ThanhTien"))}</strong>
                        </li>
                        `;
                    }).join("")}
                </ul>
                <div class="order-foot">
                    <span>${TPS.escapeHtml(diaChi)}</span>
                    <div class="order-actions">
                        ${canCancel ? `<button class="danger-button" type="button" data-cancel-order="${TPS.escapeHtml(maDonHang)}">Hủy đơn hàng</button>` : ""}
                        <span class="order-total">${TPS.formatCurrency(tongTien)}</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function fetchOrders() {
    if (!TPS.requireRole("KhachHang")) {
        return;
    }

    try {
        TPS.setStatus(ordersStatus, "Đang tải đơn hàng...");
        const payload = await TPS.request("/api/DonHang/me");
        renderOrders(TPS.unwrap(payload) || []);
    } catch (error) {
        TPS.setStatus(ordersStatus, error.message, "error");
    }
}

ordersList?.addEventListener("click", async (event) => {
    const cancelId = event.target.closest("[data-cancel-order]")?.dataset.cancelOrder;

    if (cancelId && confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
        try {
            await TPS.request(`/api/DonHang/${encodeURIComponent(cancelId)}/cancel`, { method: "PUT" });
            await fetchOrders();
            TPS.setStatus(ordersStatus, "Đã hủy đơn hàng thành công.", "success");
        } catch (error) {
            TPS.setStatus(ordersStatus, error.message, "error");
        }
    }
});

document.addEventListener("DOMContentLoaded", fetchOrders);
