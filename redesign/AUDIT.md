# UX/UI Audit Report — LexiFlow Dashboard

**Ngày đánh giá:** 29/09/2026  
**Phương pháp audit:** `web-design-guidelines`, WCAG 2.1 AA Checklist, Playwright Visual Regression.  
**Nhánh làm việc:** `redesign/ui-overhaul`

---

## 1. Tổng quan hiện trạng

Dự án **LexiFlow Web Dashboard** là hệ thống học từ vựng và luyện tập thông minh tích hợp Spaced Repetition (SM-2), Từ điển Oxford, OCR Scanner, Trắc nghiệm, Thống kê ghi nhớ, và Mạng xã hội nhóm học tập.

### Điểm mạnh hiện tại:
- Cấu trúc dữ liệu và logic nghiệp vụ đầy đủ (Dictionary, Flashcards, Quiz, OCR, Stats, Groups, Admin Events).
- Đã phân chia layout cơ bản giữa Sidebar, Topbar và Workspace Body.

### Điểm yếu UX/UI nghiêm trọng:
1. **Màu sắc & Thị giác "Generic AI"**: Sử dụng sắc xanh dương đơn điệu (`#1F6FEB`) kết hợp nền xám nhạt (`#F5F7FC`), thiếu nhận diện thương hiệu độc đáo, card bo tròn phẳng không tạo độ sâu phân cấp.
2. **Typography thiếu nhịp điệu**: Kích thước chữ chênh lệch không rõ rệt (`text-[13px]`, `text-sm`, `text-lg`), khoảng cách dòng (`line-height`) bị bó hẹp.
3. **Trải nghiệm Responsive di động kém**:
   - Sidebar di động dạng drawer nảy ra thô cứng, thiếu gesture vuốt trượt.
   - Các bảng dữ liệu (Table) và Widget lớn bị tràng viền hoặc cuộn ngang bất tiện trên màn hình 390px.
4. **Thiếu hỗ trợ ARIA & Keyboard Accessibility**:
   - Nhiều nút bấm (`<button>`) và tab không có `aria-label`, `role="tab"`, hoặc `focus-ring` khi dùng phím `Tab`.
   - Độ tương phản chữ xám nhạt trên nền trắng/xám (`text-gray-400`, `text-[#6E7781]`) không đạt chuẩn WCAG AA (tỉ lệ tương phản < 4.5:1).
5. **Trạng thái Component (Component States) thiếu hụt**:
   - Thiếu Skeleton Loaders cho các trang có dữ liệu nặng (Stats, Dictionary, Admin Events).
   - Empty States (trạng thái rỗng) quá đơn giản, không có hình minh họa hoặc CTA gợi ý hành động tiếp theo.

---

## 2. Phân loại vấn đề (Audit Issues Index)

### 🚨 CRITICAL (Nghiêm trọng - Ảnh hưởng trực tiếp UX & Accessibility)
- [ ] **CRIT-01**: **Không có Focus Ring rõ ràng**: Khi điều hướng bằng bàn phím (`Tab`), các nút trên Sidebar, Topbar và Form Input không hiển thị outline/ring trực quan, vi phạm tiêu chuẩn WAI-ARIA 2.4.7.
- [ ] **CRIT-02**: **Responsive vỡ layout trên Mobile (390px)**:
  - `AdminEventsView` và `GroupsLeaderboardView` có bảng thứ hạng và lịch sự kiện bị tràn chiều ngang màn hình di động.
  - Các ô nhập liệu Hero Search bị thu hẹp quá mức gây khó bấm (target touch size < 44px).
- [ ] **CRIT-03**: **Độ tương phản chữ thấp (Contrast Ratio < 4.5:1)**:
  - Chữ chú thích phụ (`#8C95A6`, `text-slate-400`) trên nền xám nhạt (`#EEF2FB`) bị mờ, người thị lực kém không thể đọc rõ.

### ⚠️ MAJOR (Trung bình - Ảnh hưởng tính thẩm mỹ & Hiệu suất thao tác)
- [ ] **MAJ-01**: **Thiếu Skeleton Loading States**:
  - Khi chuyển từ Trang chủ sang `Flashcards` hoặc `Dictionary`, giao diện lập tức trống trơn trước khi hiện dữ liệu, gây cảm giác giật lag.
- [ ] **MAJ-02**: **Bảng dữ liệu Recent Words & Leaderboard thiếu phân cấp**:
  - Dữ liệu hiển thị dạng danh sách phẳng, dòng kẻ mờ nhạt, thiếu highlight cho từ vựng khó hoặc thứ hạng top 3.
- [ ] **MAJ-03**: **Modal & Toast thiếu Micro-interactions**:
  - `SearchModal` và `NotificationModal` xuất hiện đột ngột thiếu hiệu ứng trượt/mờ nhẹ (`fade-in-up`, `scale-95` to `scale-100`), cảm giác thô cứng.

### 💡 MINOR (Nhỏ - Tối ưu hóa & Đánh bóng thị giác)
- [ ] **MIN-01**: **Biểu tượng (Icons) không đồng bộ kích thước**: Kích thước `lucide-react` icons nhảy từ 14px, 16px, 18px, 20px tới 24px không theo quy chuẩn design token.
- [ ] **MIN-02**: **Card Radius & Shadow thiếu chiều sâu**: Tất cả card dùng chung `rounded-xl` hoặc `shadow-2xs`, không có lớp đổ bóng thủy tinh (glassmorphism shadow) hay viền sáng (border-glow) tương tác khi hover.

---

## 3. Bản đồ User Flow & Điểm ma sát (Friction Points)

- **Flow 1: Tra cứu từ vựng** -> Hero Search -> Trùng lặp thanh tìm kiếm giữa Topbar & Hero Banner gây nhầm lẫn.
- **Flow 2: Học Spaced Repetition** -> Flashcards View -> Thao tác lật thẻ phẳng thiếu chuyển động 3D xoay chiều (`perspective: 1000px`, `transform-style: preserve-3d`).
- **Flow 3: Quét từ vựng qua ảnh OCR** -> OCR View -> Dropzone tải ảnh đơn điệu, thiếu xem trước tương tác với ô nhận diện bounding box từ vựng.
- **Flow 4: Trắc nghiệm Từ vựng** -> Quiz View -> Thanh thời gian và chọn đáp án thiếu âm thanh / hiệu ứng chúc mừng / rung nhẹ (haptic micro-feedback).

---

## 4. Kế hoạch khắc phục
1. Xuất **DESIGN.md** với hệ thống màu sắc nhã nhặn **LexiFlow Dark/Light Slate Premium System**, Font chữ **Plus Jakarta Sans**, và quy chuẩn Design Tokens.
2. Xây dựng thư viện Component nòng cốt (Atomic UI Library) chuẩn Accessible, Keyboard Focus, Micro-interactions.
3. Thiết kế lại 10 trang View đảm bảo Mobile-First & Performance.
