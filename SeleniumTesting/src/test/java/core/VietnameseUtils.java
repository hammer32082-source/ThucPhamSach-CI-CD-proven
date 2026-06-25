package core;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Tiện ích xử lý tiếng Việt: bóc dấu, so sánh không phân biệt dấu.
 * Dùng để so sánh chữ có dấu ("tồn tại") với chữ không dấu ("ton tai").
 */
public class VietnameseUtils {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    /**
     * Bóc toàn bộ dấu tiếng Việt khỏi chuỗi.
     * VD: "Tên đăng nhập đã tồn tại" → "Ten dang nhap da ton tai"
     */
    public static String removeDiacritics(String input) {
        if (input == null) return "";
        // Chuyển đ/Đ thành d/D trước khi normalize (vì NFD không xử lý đ)
        String replaced = input.replace('đ', 'd').replace('Đ', 'D');
        String normalized = Normalizer.normalize(replaced, Normalizer.Form.NFD);
        return DIACRITICS_PATTERN.matcher(normalized).replaceAll("").toLowerCase();
    }

    /**
     * Kiểm tra xem chuỗi nguồn có chứa từ khóa hay không,
     * bất kể có dấu hay không dấu.
     * VD: containsIgnoreDiacritics("Ten dang nhap da ton tai", "tồn tại") → true
     */
    public static boolean containsIgnoreDiacritics(String source, String keyword) {
        return removeDiacritics(source).contains(removeDiacritics(keyword));
    }
}
