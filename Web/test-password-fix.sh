#!/bin/bash

# Script Test Sửa Lỗi Mật Khẩu
# Dùng để kiểm tra xem fix mật khẩu có hoạt động không

API_URL="http://localhost:5259"

echo "================================"
echo "🔧 Test Sửa Lỗi Mật Khẩu"
echo "================================"
echo ""

# Kiểm tra API có chạy không
echo "1️⃣  Kiểm tra API có chạy không..."
if curl -s -f -o /dev/null "$API_URL/api/Auth" 2>/dev/null; then
    echo "✅ API đang chạy"
else
    echo "❌ API không chạy hoặc URL sai"
    echo "   Vui lòng khởi động backend tại: $API_URL"
    exit 1
fi

echo ""
echo "2️⃣  Gọi endpoint fix mật khẩu..."
RESPONSE=$(curl -s -X POST "$API_URL/api/Auth/fix-corrupted-passwords" \
    -H "Content-Type: application/json")

echo ""
echo "Response từ server:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "3️⃣  Kiểm tra kết quả..."
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Fix thành công!"
else
    echo "⚠️  Cần kiểm tra response từ server"
fi

echo ""
echo "================================"
echo "📝 Test Đăng Nhập"
echo "================================"
echo ""

# Test đăng nhập
echo "Testing login với admin01 / admin@123..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/Auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "tenDangNhap": "admin01",
        "matKhau": "admin@123"
    }')

echo ""
echo "Response từ login:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Đăng nhập thành công!"
else
    echo "❌ Đăng nhập thất bại"
fi

echo ""
echo "================================"
echo "✨ Test hoàn tất"
echo "================================"
