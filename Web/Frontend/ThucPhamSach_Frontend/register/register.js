const registerForm = document.getElementById("register-form");
const registerStatus = document.getElementById("register-status");

registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const payload = {
        hoTen: formData.get("hoTen")?.toString().trim(),
        tenDangNhap: formData.get("tenDangNhap")?.toString().trim(),
        matKhau: formData.get("matKhau")?.toString(),
        sdt: formData.get("sdt")?.toString().trim() || null,
        email: formData.get("email")?.toString().trim() || null,
        diaChi: formData.get("diaChi")?.toString().trim() || null
    };

    try {
        TPS.setStatus(registerStatus, "Đang tạo tài khoản...");
        await TPS.request("/api/Auth/register", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        TPS.setStatus(registerStatus, "Đăng ký thành công. Đang chuyển sang đăng nhập...", "success");
        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 700);
    } catch (error) {
        TPS.setStatus(registerStatus, error.message, "error");
    }
});
