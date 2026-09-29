# 🚀 LexiFlow — Multi-Platform Vocabulary Learning Ecosystem

> **Hệ thống học từ vựng tiếng Anh thông minh đa nền tảng (Web & Mobile App) tích hợp Thuật toán Lặp lại Ngắt quãng SM-2 (Spaced Repetition), OCR quét tài liệu, Speed Quiz thi đấu nhóm & Cloudflare Serverless Architecture.**

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 🧠 1. Thuật Toán SM-2 & Đồng Bộ Đa Thiết Bị Chuẩn Xác (Web ↔ App Sync)
- **Mô hình Append-Only Review Log:** Mỗi thao tác đánh giá (`Again`, `Hard`, `Good`, `Easy`) được tạo dưới dạng EventLog duy nhất (`review_id` UUID) lưu trữ phía client (IndexedDB/SQLite).
- **Tính toán lại trạng thái (Deterministic SM-2 Engine):** Server tự động sắp xếp lại chuỗi event theo thời gian và tính toán lại ngày ôn tiếp theo (`next_review`), khoảng cách (`interval`), hệ số dễ (`ease_factor`), giúp việc đồng bộ muộn hoặc học offline không làm sai lệch hay mất tiến độ.
- **Đồng bộ Cài đặt 2 Chiều (`user_settings`):** Tự động đồng bộ số từ mới/ngày, bật/tắt phím tắt, âm thanh, múi giờ giữa Web Dashboard và Mobile App.

### 🛡️ 2. Chế Độ Giảm Áp Lực Học (Catch-up Mode & Undo Rating)
- **Chống nản khi dồn từ quá hạn (Backlog Overwhelm):** Tự động phát hiện khi số từ đến hạn ôn > 100 từ, chuyển sang phiên học micro-session 15 từ.
- **Streak Freeze Tuần:** Tự động cấp bảo hộ chuỗi học (Streak Freeze) tối đa 1 lần/tuần khi tham gia Catch-up Mode.
- **Giãn lịch thông minh:** Cho phép dời lịch ôn tập của các thẻ ít ưu tiên ra các ngày tiếp theo (1-7 ngày).
- **Undo Rating & Xác nhận phím "Again":** Cho phép hoàn tác đánh giá gần nhất trong vòng 5 giây và tùy chọn bật hộp thoại xác nhận khi bấm nhầm nút Quên.

### 🎮 3. Speed Quiz Thi Đấu Nhóm & Chống Gian Lận (Anti-cheat)
- **Chấm điểm Server-side 100%:** Đáp án đúng không bao giờ gửi xuống client. Server nhận câu trả lời và tự tính điểm XP dựa trên thời gian trôi qua (`server_start_time`).
- **Thời gian Anti-Cheat:** Phát hiện tự động các bài nộp nhanh bất thường (< 350ms/câu) để gắn cờ (`flagged`) và đóng băng XP.
- **Admin Dashboard:** Cho phép Quản trị viên kiểm tra bài nộp bị gắn cờ và phê duyệt/hủy bỏ kết quả.

### ⚡ 4. Hiệu Năng Cao & Xử Lý Khung Giờ Cao Điểm (Cloudflare D1 Tuning)
- **Tự động Retry Exponential Backoff + Jitter:** Loại bỏ lỗi nghẽn ghi `SQLITE_BUSY` khi 30-50 user nộp bài cùng lúc vào khung giờ cao điểm (20:00 - 22:00).
- **Single Covered Aggregation Query:** Tải thông tin thống kê Decks qua 1 query duy nhất trên covered index (`idx_flashcards_due`), giảm thời gian phản hồi từ 340ms xuống 18ms.

### 🔔 5. Thông Báo Nhắc Học Đúng Múi Giờ & Khung Giờ Yên Tĩnh (DND)
- **Hỗ trợ múi giờ địa phương IANA (`Asia/Ho_Chi_Minh`...):** Chuyển đổi linh hoạt giờ UTC server sang giờ địa phương từng học viên.
- **Backend Quiet Hours / Do Not Disturb:** Tự động chặn hoặc hoãn gửi thông báo vào khung giờ đêm khuya (mặc định 22:00 - 07:00).

### 📷 🎧 6. OCR Quét Từ Vựng & Âm Thanh IPA Hiệu Năng Cao
- **OCR Client Preprocessing:** Bộ lọc ảnh (chuyển xám, tăng tương phản, binarization) + khung Crop tùy chỉnh + cho phép chỉnh sửa trực tiếp từ quét được trước khi lưu.
- **LRU Audio Cache:** Bộ nhớ đệm âm thanh phát âm IPA trên thiết bị (giới hạn 100MB+), hỗ trợ prefetch 3 thẻ kế tiếp và thiết lập "Chỉ tải qua Wi-Fi".

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân hệ | Công nghệ sử dụng |
| :--- | :--- |
| **Backend API** | Cloudflare Workers (TypeScript), Hono Framework |
| **Database & Storage** | Cloudflare D1 (SQLite at Edge), Cloudflare KV, Cloudflare R2 CDN |
| **Web Dashboard** | React 18, Vite, TypeScript, TailwindCSS, Lucide Icons |
| **Mobile Application** | Flutter (Dart), BLoC State Management, Local SQLite / Hive |
| **Testing** | Node.js TSX Runner, PyTest / Custom Integration Suites |

---

## 📂 Cấu Trúc Thư Mục Project (Directory Structure)

```text
lexiflow-backup-V1.0/
├── cloudflare/                 # Backend Cloudflare Workers & D1 Database
│   ├── src/
│   │   ├── db/                 # SQL Schema & Migrations
│   │   ├── routes/             # API Endpoints (flashcards, decks, battle, users...)
│   │   ├── utils/              # SM-2 Engine, D1 Retry, Notification Scheduler...
│   │   └── index.ts            # Worker Main Entrypoint
│   └── wrangler.toml           # Cloudflare Worker Configuration
├── web-dashboard/              # Ứng dụng Web Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/         # React UI Components & Views
│   │   ├── utils/              # Review Sync Engine (IndexedDB)
│   │   └── App.tsx
│   └── package.json
├── lib/                        # Mã nguồn Mobile App (Flutter)
│   ├── core/                   # Routes, Themes, Constants
│   ├── data/                   # Models, Repositories, SQLite Local DB
│   ├── presentation/           # Flutter Screens & BLoC States
│   └── services/               # Sync Service, Audio Cache Manager
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu Cầu Tiền Đề (Prerequisites)
- **Node.js**: v18.0 trở lên
- **Flutter SDK**: v3.19.0 trở lên
- **Wrangler CLI**: `npm install -g wrangler`

---

### 1. Khởi Chạy Backend Cloudflare Workers

```bash
# Di chuyển vào thư mục cloudflare
cd cloudflare

# Cài đặt thư viện
npm install

# Chạy Migration D1 Database ở môi trường Local
npx wrangler d1 migrations apply DB --local

# Chạy Server Backend ở môi trường Local (Port 8787)
npm run dev
```

---

### 2. Khởi Chạy Web Dashboard

```bash
# Di chuyển vào thư mục web-dashboard
cd ../web-dashboard

# Cài đặt thư viện
npm install

# Khởi chạy Web Dev Server (Port 5173)
npm run dev
```

> Mở trình duyệt tại: `http://localhost:5173`

---

### 3. Khởi Chạy Mobile App (Flutter)

```bash
# Di chuyển về thư mục gốc project
cd ..

# Tải các gói phụ thuộc Flutter
flutter pub get

# Khởi chạy trên Thiết bị ảo (Emulator) hoặc Máy thật
flutter run
```

---

## 🧪 Kiểm Thử Tự Động (Testing)

Hệ thống đi kèm bộ kiểm thử tự động cho các thành phần lõi Backend:

```bash
cd cloudflare

# Test thuật toán SM-2 recalculation & Idempotency
npx tsx test_sm2.js

# Test D1 Retry Exponential Backoff + Jitter
npx tsx test_hangmuc2.js

# Test Catch-up Mode & Weekly Streak Freeze
npx tsx test_hangmuc3.js

# Test Speed Quiz Server-side Anti-Cheat
npx tsx test_hangmuc5.js

# Test IANA Timezone Scheduler & Overnight DND
npx tsx test_hangmuc6.js

# Test LRU Audio Cache
node test_hangmuc7.js
```

---

## 📜 Danh Sách API Route Chính (Core API Endpoints)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/v1/flashcards` | Lấy danh sách thẻ từ vựng |
| `GET` | `/api/v1/flashcards/due` | Lấy thẻ đến hạn ôn tập (Kèm gợi ý Catch-up) |
| `POST` | `/api/v1/flashcards/review-events` | Batch append review log (Idempotent) |
| `POST` | `/api/v1/flashcards/review-events/undo` | Hoàn tác lượt đánh giá vừa thực hiện |
| `POST` | `/api/v1/flashcards/catch-up/start` | Bắt đầu phiên giảm áp lực 15 từ + Streak Freeze |
| `POST` | `/api/v1/flashcards/catch-up/reschedule` | Giãn lịch ôn tập của phần nợ backlog |
| `GET` | `/api/decks/summary` | Thống kê số thẻ theo deck (Single Query Covered Index) |
| `POST` | `/api/battle/session/start` | Tạo quiz session mới (Giấu đáp án đúng) |
| `POST` | `/api/battle/session/submit-answer` | Chấm điểm & kiểm tra thời gian chống gian lận |
| `GET` | `/api/battle/admin/flagged` | Xem danh sách bài thi nghi vấn gian lận |
| `GET/POST` | `/api/v1/users/settings` | Đồng bộ cài đặt cá nhân 2 chiều giữa Web & App |

---

## 📄 Bản Quyền & Tác Giả (License & Authors)

* **Phát triển bởi:** LexiFlow Team
* **Mã nguồn:** Lưu trữ tại Repository [pnahy0304/lexiflow-backup-V1.0](https://github.com/pnahy0304/lexiflow-backup-V1.0)
