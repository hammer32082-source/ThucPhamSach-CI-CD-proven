const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = {
        tenDangNhap: formData.get("tenDangNhap")?.toString().trim(),
        matKhau: formData.get("matKhau")?.toString()
    };

    try {
        TPS.setStatus(loginStatus, "Đang đăng nhập...");
        const response = await TPS.request("/api/Auth/login", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const auth = TPS.unwrap(response);
        TPS.saveAuth(auth);
        TPS.setStatus(loginStatus, "Đăng nhập thành công. Đang chuyển trang...", "success");

        const user = TPS.getUser();
        setTimeout(() => {
            window.location.href = user?.vaiTro === "Admin" ? "../admin/admin.html" : "../index.html";
        }, 450);
    } catch (error) {
        TPS.setStatus(loginStatus, error.message, "error");
    }
});
