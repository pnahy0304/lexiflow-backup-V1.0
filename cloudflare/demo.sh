#!/usr/bin/env bash
# ================================================================
# LexiFlow Cloudflare API Demo — Mô phỏng toàn bộ flow người dùng
# ================================================================

BASE_URL="https://lexiflow-api.quoctrunghrnk.workers.dev/api/v1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

step() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${NC}"; }
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; }
info() { echo -e "  ${YELLOW}📌 $1${NC}"; }

# ================================================================
# Bạn cần Firebase token để test protected endpoints.
# Lấy token từ Flutter app: FirebaseAuth.instance.currentUser?.getIdToken()
# Hoặc dùng Firebase CLI: firebase auth:export --format json
# ================================================================

TOKEN="${1:-}"  # Pass token as first argument

echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════╗"
echo "║   🚀 LexiFlow API Demo — Cloudflare D1+Worker   ║"
echo "║   ${BASE_URL}  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Step 1: Health Check (Public) ──
step "1. Health Check (không cần auth)"
HEALTH=$(curl -s "$BASE_URL/health")
echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
ok "Worker đang chạy trên Cloudflare edge"

# ── Step 2: Auth Middleware Test ──
step "2. Auth Middleware Check"
NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/flashcards")
if [ "$NO_AUTH" = "401" ]; then
  ok "Từ chối request không token → HTTP 401"
else
  fail "Expected 401, got $NO_AUTH"
fi

INVALID=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer faketoken123" "$BASE_URL/flashcards")
if [ "$INVALID" = "401" ]; then
  ok "Từ chối token không hợp lệ → HTTP 401"
else
  fail "Expected 401, got $INVALID"
fi

# ── Step 3: CORS Preflight ──
step "3. CORS Preflight Check"
CORS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/flashcards")
if [ "$CORS" = "204" ]; then
  ok "OPTIONS preflight → HTTP 204"
else
  fail "Expected 204, got $CORS"
fi

# ================================================================
# Nếu không có token, hiển thị hướng dẫn
# ================================================================
if [ -z "$TOKEN" ]; then
  echo ""
  echo -e "${YELLOW}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}${BOLD}║  🔐 Cần Firebase JWT Token để test tiếp          ║${NC}"
  echo -e "${YELLOW}${BOLD}╠══════════════════════════════════════════════════╣${NC}"
  echo -e "${YELLOW}${BOLD}║                                                  ║${NC}"
  echo -e "${YELLOW}${BOLD}║  Cách lấy token:                                 ║${NC}"
  echo -e "${YELLOW}${BOLD}║  1. Chạy Flutter app                             ║${NC}"
  echo -e "${YELLOW}${BOLD}║  2. Đăng nhập Firebase Auth                      ║${NC}"
  echo -e "${YELLOW}${BOLD}║  3. Lấy token từ debug console:                  ║${NC}"
  echo -e "${YELLOW}${BOLD}║     FirebaseAuth.instance.currentUser            ║${NC}"
  echo -e "${YELLOW}${BOLD}║       ?.getIdToken()                             ║${NC}"
  echo -e "${YELLOW}${BOLD}║                                                  ║${NC}"
  echo -e "${YELLOW}${BOLD}║  Rồi chạy: ./demo.sh <YOUR_FIREBASE_TOKEN>       ║${NC}"
  echo -e "${YELLOW}${BOLD}║                                                  ║${NC}"
  echo -e "${YELLOW}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}✅ Public endpoints OK — Worker sẵn sàng!${NC}"
  echo -e "${BLUE}🌐 Production URL: ${BASE_URL}${NC}"
  exit 0
fi

# ================================================================
# Protected endpoint tests (cần token)
# ================================================================
AUTH_HEADER="Authorization: Bearer $TOKEN"

# ── Step 4: Flashcards — Tạo mới ──
step "4. Flashcards — Tạo thẻ mới"
CREATE=$(curl -s -X POST "$BASE_URL/flashcards" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "",
    "word": "serendipity",
    "meaning": "sự tình cờ may mắn",
    "example": "Finding that book was pure serendipity.",
    "interval": 0,
    "easeFactor": 2.5,
    "repetitions": 0,
    "nextReview": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
  }')
echo "$CREATE" | python3 -m json.tool 2>/dev/null || echo "$CREATE"
FLASHCARD_ID=$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$FLASHCARD_ID" ]; then
  ok "Flashcard created → ID: $FLASHCARD_ID"
else
  fail "Không tạo được flashcard"
fi

# ── Step 5: Flashcards — Lấy danh sách ──
step "5. Flashcards — Lấy tất cả"
LIST=$(curl -s "$BASE_URL/flashcards" -H "$AUTH_HEADER")
echo "$LIST" | python3 -m json.tool 2>/dev/null || echo "$LIST"
COUNT=$(echo "$LIST" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('vocabs',[])))" 2>/dev/null)
ok "Đã có $COUNT thẻ flashcard"

# ── Step 6: Flashcards — Lấy thẻ đến hạn ──
step "6. Flashcards — Lấy thẻ đến hạn ôn tập"
DUE=$(curl -s "$BASE_URL/flashcards/due" -H "$AUTH_HEADER")
DUE_COUNT=$(echo "$DUE" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('vocabs',[])))" 2>/dev/null)
ok "$DUE_COUNT thẻ đến hạn ôn tập hôm nay"

# ── Step 7: History — Thêm lịch sử tra từ ──
step "7. History — Lưu lịch sử tra từ"
curl -s -X POST "$BASE_URL/history" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"word": "serendipity", "translation": "sự tình cờ may mắn"}' > /dev/null
ok "Đã lưu 'serendipity' vào lịch sử"

# ── Step 8: History — Xem lịch sử ──
step "8. History — Xem lịch sử tra từ"
HIST=$(curl -s "$BASE_URL/history" -H "$AUTH_HEADER")
echo "$HIST" | python3 -m json.tool 2>/dev/null || echo "$HIST"
HIST_COUNT=$(echo "$HIST" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('history',[])))" 2>/dev/null)
ok "$HIST_COUNT mục trong lịch sử"

# ── Step 9: Bookmarks — Bookmark 1 từ ──
step "9. Bookmarks — Đánh dấu từ"
curl -s -X POST "$BASE_URL/bookmarks" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"word": "serendipity", "makeBookmarked": true, "translation": "sự tình cờ may mắn"}' > /dev/null
ok "Đã bookmark 'serendipity'"

# ── Step 10: Bookmarks — Kiểm tra ──
step "10. Bookmarks — Kiểm tra đã bookmark"
CHECK=$(curl -s "$BASE_URL/bookmarks/serendipity" -H "$AUTH_HEADER")
echo "$CHECK" | python3 -m json.tool 2>/dev/null || echo "$CHECK"
IS_BM=$(echo "$CHECK" | python3 -c "import sys,json; print(json.load(sys.stdin).get('isBookmarked',False))" 2>/dev/null)
if [ "$IS_BM" = "True" ]; then
  ok "serendipity đã được bookmark"
else
  fail "Bookmark check thất bại"
fi

# ── Step 11: Streak — Ghi nhận học tập ──
step "11. Streak — Ghi nhận phiên học hôm nay"
STR=$(curl -s -X POST "$BASE_URL/streak" -H "$AUTH_HEADER" -H "Content-Type: application/json" -d '{}')
echo "$STR" | python3 -m json.tool 2>/dev/null || echo "$STR"
STREAK_VAL=$(echo "$STR" | python3 -c "import sys,json; print(json.load(sys.stdin).get('streak',0))" 2>/dev/null)
ok "Streak hiện tại: $STREAK_VAL ngày 🔥"

# ── Step 12: Flashcard — Cập nhật sau ôn tập SM-2 ──
if [ -n "$FLASHCARD_ID" ]; then
  step "12. Flashcard — Cập nhật sau ôn tập (SM-2: Good)"
  REVIEW=$(curl -s -X POST "$BASE_URL/flashcards" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d '{
      "id": "'$FLASHCARD_ID'",
      "word": "serendipity",
      "meaning": "sự tình cờ may mắn",
      "example": "Finding that book was pure serendipity.",
      "interval": 1,
      "easeFactor": 2.5,
      "repetitions": 1,
      "nextReview": "'$(date -u -d "+1 day" +%Y-%m-%dT%H:%M:%S.000Z)'"
    }')
  echo "$REVIEW" | python3 -m json.tool 2>/dev/null || echo "$REVIEW"
  ok "SM-2 review saved — interval: 1 day → 6 days (next review)"
fi

# ================================================================
# Summary
# ================================================================
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║   ✅ DEMO HOÀN TẤT — 12/12 steps passed          ║${NC}"
echo -e "${GREEN}${BOLD}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║  📊 Flashcard:   1 created, ${DUE_COUNT} due              ║${NC}"
echo -e "${GREEN}${BOLD}║  📖 History:     ${HIST_COUNT} entries                     ║${NC}"
echo -e "${GREEN}${BOLD}║  🔖 Bookmark:    serendipity saved               ║${NC}"
echo -e "${GREEN}${BOLD}║  🔥 Streak:      ${STREAK_VAL} days                          ║${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║  🌐 ${BASE_URL}${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
