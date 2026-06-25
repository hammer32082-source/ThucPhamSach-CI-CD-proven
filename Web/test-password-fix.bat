@echo off
REM Script Test Sửa Lỗi Mật Khẩu (Windows)
REM Dùng để kiểm tra xem fix mật khẩu có hoạt động không

setlocal enabledelayedexpansion

set API_URL=http://localhost:5259
set TEMP_FILE=%TEMP%\response.json

echo ================================
echo 🔧 Test Sua Loi Mat Khau (Windows)
echo ================================
echo.

REM Kiểm tra API có chạy không
echo 1️⃣  Kiem tra API co chay khong...
curl -s -f -o nul "%API_URL%/api/Auth" 2>nul
if !errorlevel! equ 0 (
    echo ✅ API dang chay
) else (
    echo ❌ API khong chay hoac URL sai
    echo    Vui long khoi dong backend tai: %API_URL%
    pause
    exit /b 1
)

echo.
echo 2️⃣  Goi endpoint fix mat khau...
curl -s -X POST "%API_URL%/api/Auth/fix-corrupted-passwords" ^
    -H "Content-Type: application/json" > "%TEMP_FILE%"

echo.
echo Response tu server:
type "%TEMP_FILE%"

echo.
echo 3️⃣  Kiem tra ket qua...
findstr /M "success" "%TEMP_FILE%" >nul
if !errorlevel! equ 0 (
    echo ✅ Fix thanh cong!
) else (
    echo ⚠️  Can kiem tra response tu server
)

echo.
echo ================================
echo 📝 Test Dang Nhap
echo ================================
echo.

REM Test đăng nhập
echo Testing login voi admin01 / admin@123...
curl -s -X POST "%API_URL%/api/Auth/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"tenDangNhap\": \"admin01\", \"matKhau\": \"admin@123\"}" > "%TEMP_FILE%"

echo.
echo Response tu login:
type "%TEMP_FILE%"

findstr /M "success" "%TEMP_FILE%" >nul
if !errorlevel! equ 0 (
    echo ✅ Dang nhap thanh cong!
) else (
    echo ❌ Dang nhap that bai
)

echo.
echo ================================
echo ✨ Test hoan tat
echo ================================
echo.

REM Cleanup
del "%TEMP_FILE%" 2>nul

pause
