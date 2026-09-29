import { Hono } from 'hono';
import type { Bindings, Variables, ApiResponse } from '../types/index.js';

export const battleRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

export interface BattleQuestion {
  index: number;
  word: string;
  phonetic: string;
  correctAnswer: string;
  options: string[];
}

export interface BattlePlayer {
  uid: string;
  name: string;
  avatarUrl: string;
  score: number;
  isReady: boolean;
  connected: boolean;
  answers: Record<number, { selected: string; isCorrect: boolean; timeMs: number }>;
}

export interface BattleRoom {
  roomId: string;
  roomCode: string;
  mode: '1v1' | 'kahoot';
  status: 'lobby' | 'playing' | 'ended';
  hostUid: string;
  currentQuestionIndex: number;
  questions: BattleQuestion[];
  players: Record<string, BattlePlayer>;
  createdAt: number;
}

// In-Memory Room Store for Cloudflare Worker Instance State & Fast Realtime Sync
const roomStore = new Map<string, BattleRoom>();
const sseClients = new Map<string, Set<(data: string) => void>>();

function generateRoomCode(mode: '1v1' | 'kahoot'): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return mode === '1v1' ? `BTL-${num}` : `ROOM-${num}`;
}

const mockBattleQuestions: BattleQuestion[] = [
  {
    index: 0,
    word: 'meticulous',
    phonetic: '/məˈtɪkjələs/',
    correctAnswer: 'Tỉ mỉ, cẩn thận',
    options: ['Tỉ mỉ, cẩn thận', 'Hào hứng', 'Do dự, ngập ngừng', 'Dễ vỡ']
  },
  {
    index: 1,
    word: 'serendipity',
    phonetic: '/ˌserənˈdɪpəti/',
    correctAnswer: 'Sự tình cờ may mắn',
    options: ['Rủi ro đột ngột', 'Sự tình cờ may mắn', 'Kế hoạch chi tiết', 'Nỗi buồn thầm lặng']
  },
  {
    index: 2,
    word: 'resilient',
    phonetic: '/rɪˈzɪliənt/',
    correctAnswer: 'Kiên cường, phục hồi nhanh',
    options: ['Cứng nhắc', 'Kiên cường, phục hồi nhanh', 'Yếu đuối', 'Chậm chạp']
  },
  {
    index: 3,
    word: 'ephemeral',
    phonetic: '/ɪˈfemərəl/',
    correctAnswer: 'Phù du, ngắn ngủi',
    options: ['Vĩnh cửu', 'Phù du, ngắn ngủi', 'Rõ ràng', 'Bí ẩn']
  },
  {
    index: 4,
    word: 'eloquent',
    phonetic: '/ˈeləkwənt/',
    correctAnswer: 'Hùng hồn, lưu loát',
    options: ['Hùng hồn, lưu loát', 'Im lặng', 'Do dự', 'Khó hiểu']
  }
];

function broadcastToRoom(roomId: string, event: string, payload: any) {
  const clients = sseClients.get(roomId);
  if (!clients) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((send) => send(msg));
}

/**
 * POST /api/battle/create
 * Create 1v1 battle or Kahoot group room
 */
battleRoutes.post('/create', async (c) => {
  try {
    const body = await c.req.json<{
      hostUid: string;
      hostName: string;
      hostAvatar?: string;
      mode: '1v1' | 'kahoot';
    }>();

    if (!body.hostUid || !body.hostName) {
      return c.json<ApiResponse>({ success: false, error: 'Missing hostUid or hostName' }, 400);
    }

    const roomId = `room-${Date.now()}`;
    const roomCode = generateRoomCode(body.mode || '1v1');

    const newRoom: BattleRoom = {
      roomId,
      roomCode,
      mode: body.mode || '1v1',
      status: 'lobby',
      hostUid: body.hostUid,
      currentQuestionIndex: 0,
      questions: mockBattleQuestions,
      players: {
        [body.hostUid]: {
          uid: body.hostUid,
          name: body.hostName,
          avatarUrl: body.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.hostUid}`,
          score: 0,
          isReady: true,
          connected: true,
          answers: {}
        }
      },
      createdAt: Date.now()
    };

    roomStore.set(roomId, newRoom);
    roomStore.set(roomCode, newRoom);

    return c.json<ApiResponse<BattleRoom>>({
      success: true,
      data: newRoom
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/battle/join
 * Join battle room by roomCode
 */
battleRoutes.post('/join', async (c) => {
  try {
    const body = await c.req.json<{
      roomCode: string;
      uid: string;
      name: string;
      avatarUrl?: string;
    }>();

    if (!body.roomCode || !body.uid) {
      return c.json<ApiResponse>({ success: false, error: 'Missing roomCode or uid' }, 400);
    }

    const code = body.roomCode.trim().toUpperCase();
    const room = roomStore.get(code);

    if (!room) {
      return c.json<ApiResponse>({ success: false, error: 'Phòng đấu không tồn tại hoặc đã kết thúc' }, 404);
    }

    if (room.mode === '1v1' && Object.keys(room.players).length >= 2 && !room.players[body.uid]) {
      return c.json<ApiResponse>({ success: false, error: 'Phòng 1v1 đã đủ 2 người' }, 400);
    }

    room.players[body.uid] = {
      uid: body.uid,
      name: body.name || 'Người chơi LexiFlow',
      avatarUrl: body.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.uid}`,
      score: 0,
      isReady: true,
      connected: true,
      answers: {}
    };

    // Auto start 1v1 battle if 2 players joined
    if (room.mode === '1v1' && Object.keys(room.players).length === 2) {
      room.status = 'playing';
      room.currentQuestionIndex = 0;
    }

    broadcastToRoom(room.roomId, 'room_update', room);

    return c.json<ApiResponse<BattleRoom>>({
      success: true,
      data: room
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/battle/submit-answer
 * Submit question answer in real-time
 */
battleRoutes.post('/submit-answer', async (c) => {
  try {
    const body = await c.req.json<{
      roomId: string;
      uid: string;
      questionIndex: number;
      answerOption: string;
      responseTimeMs: number;
    }>();

    const room = roomStore.get(body.roomId);
    if (!room) {
      return c.json<ApiResponse>({ success: false, error: 'Phòng đấu không tồn tại' }, 404);
    }

    const player = room.players[body.uid];
    if (!player) {
      return c.json<ApiResponse>({ success: false, error: 'Người chơi không trong phòng này' }, 400);
    }

    const q = room.questions[body.questionIndex];
    const isCorrect = q && q.correctAnswer === body.answerOption;
    
    // Scoring logic: 100 base points if correct + speed bonus (up to 50 pts for fast response within 15s)
    let speedBonus = 0;
    if (isCorrect) {
      speedBonus = Math.max(0, Math.round((15000 - Math.min(body.responseTimeMs, 15000)) / 300));
      player.score += (100 + speedBonus);
    }

    player.answers[body.questionIndex] = {
      selected: body.answerOption,
      isCorrect,
      timeMs: body.responseTimeMs
    };

    // Check if all players answered current question
    const playerArray = Object.values(room.players);
    const allAnswered = playerArray.every((p) => p.answers[body.questionIndex] !== undefined);

    if (allAnswered) {
      if (room.currentQuestionIndex < room.questions.length - 1) {
        room.currentQuestionIndex += 1;
      } else {
        room.status = 'ended';
      }
    }

    broadcastToRoom(room.roomId, 'score_update', {
      room,
      lastAnsweredBy: player.name,
      isCorrect,
      earnedPoints: isCorrect ? (100 + speedBonus) : 0
    });

    return c.json<ApiResponse<{ isCorrect: boolean; pointsEarned: number; room: BattleRoom }>>({
      success: true,
      data: {
        isCorrect,
        pointsEarned: isCorrect ? (100 + speedBonus) : 0,
        room
      }
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * GET /api/battle/room/:roomId
 * Fetch current state of room
 */
battleRoutes.get('/room/:roomId', async (c) => {
  const roomId = c.req.param('roomId');
  const room = roomStore.get(roomId);
  if (!room) {
    return c.json<ApiResponse>({ success: false, error: 'Phòng không tồn tại' }, 404);
  }
  return c.json<ApiResponse<BattleRoom>>({ success: true, data: room });
});

// In-Memory Quiz Session Store for Server-side Scoring & Anti-cheat
export interface ServerQuizSession {
  sessionId: string;
  uid: string;
  serverStartTime: number;
  questions: Array<{ id: string; word: string; phonetic: string; options: string[]; correctAnswer: string }>;
  answers: Record<string, { selected: string; durationMs: number; isCorrect: boolean }>;
  status: 'active' | 'submitted' | 'flagged';
  earnedXp: number;
  flagReason?: string;
  createdAt: number;
}

const quizSessionStore = new Map<string, ServerQuizSession>();
const flaggedSessions: ServerQuizSession[] = [];

/**
 * POST /api/battle/session/start
 * Create server-managed quiz session with hidden correct answers
 */
battleRoutes.post('/session/start', async (c) => {
  try {
    const body = await c.req.json<{ uid: string }>();
    if (!body.uid) {
      return c.json<ApiResponse>({ success: false, error: 'Missing uid' }, 400);
    }

    const sessionId = `qsession-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const questions = mockBattleQuestions.map((q) => ({
      id: `q-${q.index}`,
      word: q.word,
      phonetic: q.phonetic,
      options: [...q.options].sort(() => Math.random() - 0.5),
      correctAnswer: q.correctAnswer
    }));

    const session: ServerQuizSession = {
      sessionId,
      uid: body.uid,
      serverStartTime: Date.now(),
      questions,
      answers: {},
      status: 'active',
      earnedXp: 0,
      createdAt: Date.now()
    };

    quizSessionStore.set(sessionId, session);

    // Sanitize questions sent to client: DO NOT INCLUDE correctAnswer!
    const clientQuestions = questions.map(({ correctAnswer, ...rest }) => rest);

    return c.json<ApiResponse<{ sessionId: string; questions: any[] }>>({
      success: true,
      data: {
        sessionId,
        questions: clientQuestions
      }
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/battle/session/submit-answer
 * Chấm điểm phía Server-side & Kiểm tra thời gian Anti-Cheat
 */
battleRoutes.post('/session/submit-answer', async (c) => {
  try {
    const body = await c.req.json<{
      sessionId: string;
      questionId: string;
      selectedOption: string;
    }>();

    const session = quizSessionStore.get(body.sessionId);
    if (!session) {
      return c.json<ApiResponse>({ success: false, error: 'Quiz session không tồn tại hoặc đã hết hạn' }, 404);
    }

    if (session.status !== 'active') {
      return c.json<ApiResponse>({ success: false, error: 'Quiz session đã hoàn thành hoặc bị tạm khóa' }, 400);
    }

    const question = session.questions.find((q) => q.id === body.questionId);
    if (!question) {
      return c.json<ApiResponse>({ success: false, error: 'Câu hỏi không hợp lệ' }, 400);
    }

    const now = Date.now();
    const durationMs = now - session.serverStartTime;

    // Server-side Anti-Cheat Check: If response time per question is under 350ms, flag as bot/cheat
    const isBotLike = durationMs < 350;
    const isCorrect = question.correctAnswer === body.selectedOption;

    session.answers[body.questionId] = {
      selected: body.selectedOption,
      durationMs,
      isCorrect
    };

    let pointsEarned = 0;
    if (isCorrect && !isBotLike) {
      pointsEarned = 100;
      session.earnedXp += pointsEarned;
    }

    if (isBotLike) {
      session.status = 'flagged';
      session.flagReason = `Phát hiện phản hồi bất thường quá nhanh (${durationMs}ms < 350ms)`;
      flaggedSessions.push(session);
    }

    return c.json<ApiResponse<{ isCorrect: boolean; pointsEarned: number; isFlagged: boolean }>>({
      success: true,
      data: {
        isCorrect,
        pointsEarned: isBotLike ? 0 : pointsEarned,
        isFlagged: session.status === 'flagged'
      }
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * GET /api/battle/admin/flagged
 * Admin endpoint: Xem danh sách các bài làm bị gắn cờ nghi vấn gian lận
 */
battleRoutes.get('/admin/flagged', async (c) => {
  return c.json<ApiResponse<{ flaggedSessions: ServerQuizSession[] }>>({
    success: true,
    data: { flaggedSessions }
  });
});

/**
 * POST /api/battle/admin/resolve
 * Admin endpoint: Khôi phục XP nếu gắn cờ nhầm
 */
battleRoutes.post('/admin/resolve', async (c) => {
  try {
    const body = await c.req.json<{ sessionId: string; action: 'approve' | 'reject' }>();
    const idx = flaggedSessions.findIndex((s) => s.sessionId === body.sessionId);
    if (idx === -1) {
      return c.json<ApiResponse>({ success: false, error: 'Flagged session not found' }, 404);
    }

    const session = flaggedSessions[idx];
    if (body.action === 'approve') {
      session.status = 'submitted';
      flaggedSessions.splice(idx, 1);
      return c.json<ApiResponse>({ success: true, message: 'Đã phê duyệt và cộng XP hợp lệ.' });
    } else {
      flaggedSessions.splice(idx, 1);
      return c.json<ApiResponse>({ success: true, message: 'Đã hủy bài thi gian lận.' });
    }
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

