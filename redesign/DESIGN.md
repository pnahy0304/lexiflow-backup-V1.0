# LexiFlow Design System Specification (`DESIGN.md`)

**Phiên bản:** 2.0 (Redesign Overhaul)  
**Tác giả:** Principal Product Designer & Senior Frontend Engineer  
**Phong cách chủ đạo:** *Modern High-End AI Learning Dashboard (Electric Indigo & Slate)*

---

## 1. Triết lý Thiết kế (Design Philosophy)

1. **Vibrant & Purposeful**: Loại bỏ sự đơn điệu nhạt nhẽo. Sử dụng sắc chàm điện tử (`Electric Indigo #4F46E5`), xanh coban thanh lịch (`#2563EB`) và ngọc bích điểm nhấn (`#10B981`) cho cảm giác hiện đại, kích thích động lực học tập.
2. **Depth & Tactility**: Kết hợp các lớp bề mặt phân cấp (Layered Surfaces), hiệu ứng mờ nhòe kính (Glassmorphism `backdrop-blur-md`), viền phát sáng nhẹ (Subtle Glow Border `ring-1 ring-indigo-500/20`), và bóng đổ mềm mại (Soft Dynamic Elevation).
3. **Typographic Hierarchy**: Sử dụng font **Plus Jakarta Sans** (Sans-serif hiện đại của Google Fonts) với khoảng cách chữ cân đối, tỉ lệ phân cấp rõ ràng từ Display Heading đến Caption.
4. **Micro-Interactions**: Mọi tương tác (Hover, Focus, Active, Toggle, Slide) đều có phản hồi siêu mượt trong khoảng 150ms – 250ms với đường cong gia tốc `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 2. Design Tokens

### A. Bảng màu (Color Palette)

#### Light Mode (Nền sáng hiện đại)
- **Background App**: `#F8FAFC` (Slate 50)
- **Surface / Card Base**: `#FFFFFF` (Pure White)
- **Surface Elevated / Hover**: `#F1F5F9` (Slate 100)
- **Border Surface**: `#E2E8F0` (Slate 200)
- **Border Focus / Active**: `#6366F1` (Indigo 500)
- **Text Primary**: `#0F172A` (Slate 900 - Tương phản cực đại 14:1)
- **Text Secondary**: `#475569` (Slate 600)
- **Text Muted**: `#94A3B8` (Slate 400)

#### Brand & Accent Colors (Điểm nhấn thương hiệu)
- **Primary Indigo**: `#4F46E5` (Indigo 600) | Gradient: `from-[#4F46E5] to-[#7C3AED]`
- **Success Emerald**: `#10B981` (Emerald 500)
- **Warning Amber**: `#F59E0B` (Amber 500)
- **Danger Crimson**: `#EF4444` (Red 500)
- **Badge XP / Gold**: `#D97706` (Amber 600)

### B. Font Chữ & Tỉ lệ Typography (Typography Scale)

| Token Name | Kích thước | Line Height | Weight | Sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| `font-display-2xl` | 32px (2rem) | 1.25 | Bold (700) | Banner Greeting, Hero Titles |
| `font-display-xl` | 24px (1.5rem) | 1.3 | SemiBold (600) | Tiêu đề Trang (Page Headers) |
| `font-title-lg` | 18px (1.125rem) | 1.4 | SemiBold (600) | Tiêu đề Card, Modal Header |
| `font-body-md` | 14px (0.875rem) | 1.5 | Normal (400) / Medium (500) | Nội dung chính, Từ vựng, Dữ liệu |
| `font-caption-sm` | 12px (0.75rem) | 1.5 | Medium (500) | Badge, Tag, Chú thích thời gian |

### C. Khoảng cách & Bo góc (Spacing & Radius)

- **Border Radius**:
  - `rounded-lg`: 8px (Nút nhỏ, Input, Badge)
  - `rounded-xl`: 12px (Input lớn, Dropdown, Toast)
  - `rounded-2xl`: 16px (Card, Container, Widget)
  - `rounded-3xl`: 24px (Hero Banner, Modal Dialog)
- **Shadows**:
  - `shadow-subtle`: `0 1px 3px 0 rgba(15, 23, 42, 0.05)`
  - `shadow-card`: `0 4px 20px -2px rgba(15, 23, 42, 0.08)`
  - `shadow-glow`: `0 8px 25px -4px rgba(79, 70, 229, 0.25)`

---

## 3. Quy tắc Thiết kế Component (Vercel Composition Patterns)

1. **Compound Components**: Ưu tiên dạng `<Card><Card.Header /><Card.Body /><Card.Footer /></Card>` thay vì truyền quá nhiều props dạng boolean (`hasHeader`, `isFooterVisible`).
2. **Keyboard Accessibility**: Mọi phần tử tương tác đều chứa `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2`.
3. **Empty & Loading States**: Mọi danh sách/bảng khi tải đều có `<SkeletonLoader />` dạng shimmery, khi trống có `<EmptyState />` kèm hình minh họa icon SVG sinh động và nút Action rõ ràng.
