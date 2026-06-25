(function () {
    const SIGNALR_CDN = "https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js";

    function loadSignalRScript() {
        return new Promise((resolve, reject) => {
            if (window.signalR) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.src = SIGNALR_CDN;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Toast functionality moved to api.js (window.TPS.showToast)

    async function initSignalR() {
        const token = window.TPS?.getToken();
        if (!token) return; // Not logged in

        try {
            await loadSignalRScript();

            const baseUrl = localStorage.getItem("tps_api_base_url") || "http://localhost:5259";
            const hubUrl = `${baseUrl}/orderHub`;

            const connection = new signalR.HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => token
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000]) // Custom reconnect intervals
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Handle events
            connection.on("ReceiveNewOrder", (order) => {
                const maDH = window.TPS?.getField(order, "maDonHang", "MaDonHang") || "N/A";
                const tenKH = window.TPS?.getField(order, "hoTenKhachHang", "HoTenKhachHang") || "Khách";
                window.TPS?.showToast(`Đơn hàng mới: ${maDH} từ ${tenKH}`, "success");

                // Tự động tải lại danh sách đơn hàng cho Admin
                if (typeof window.loadOrders === "function") {
                    window.loadOrders();
                }
            });

            connection.on("ReceiveOrderStatusUpdate", (order) => {
                const maDH = window.TPS?.getField(order, "maDonHang", "MaDonHang") || "N/A";
                const trangThai = window.TPS?.getField(order, "trangThaiDonHang", "TrangThaiDonHang") || "";
                const tenKH = window.TPS?.getField(order, "hoTenKhachHang", "HoTenKhachHang") || "Khách hàng";
                const isAdmin = window.TPS?.getUser()?.vaiTro === "Admin";
                const isCancelled = trangThai === "Da huy";

                if (isAdmin && isCancelled) {
                    window.TPS?.showToast(`Khách hàng ${tenKH} vừa hủy đơn ${maDH}.`, "warning");
                } else {
                    window.TPS?.showToast(`Đơn hàng ${maDH} vừa chuyển sang: ${window.TPS?.viText(trangThai)}`, "info");
                }

                if (isAdmin && typeof window.applyOrderRealtimeUpdate === "function") {
                    window.applyOrderRealtimeUpdate(order);
                } else if (typeof window.fetchOrders === "function") {
                    window.fetchOrders();
                }
            });

            // Connection state handlers
            connection.onreconnecting((error) => {
                console.warn("SignalR Reconnecting:", error);
                window.TPS?.showToast("Mất kết nối. Đang thử kết nối lại...", "warning");
            });

            connection.onreconnected((connectionId) => {
                console.log("SignalR Reconnected:", connectionId);
                window.TPS?.showToast("Đã kết nối lại thành công!", "success");

                if (typeof window.loadOrders === "function") {
                    window.loadOrders();
                }

                if (typeof window.fetchOrders === "function") {
                    window.fetchOrders();
                }
            });

            connection.onclose((error) => {
                console.error("SignalR Closed:", error);
                if (error) {
                    window.TPS?.showToast("Mất kết nối tới máy chủ. Vui lòng tải lại trang.", "error");
                }
            });

            await connection.start();
            console.log("SignalR Connected to", hubUrl);
            window.TPSOrderHubConnection = connection;

        } catch (err) {
            console.error("Lỗi khởi tạo SignalR:", err);
            if (err && err.toString().includes("401") && window.TPS && window.TPS.clearAuth) {
                window.TPS.clearAuth();
            }
        }
    }

    // Initialize when DOM is ready and TPS is available
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(initSignalR, 1000); // Wait a bit for auth state to settle
        });
    } else {
        setTimeout(initSignalR, 1000);
    }
})();
