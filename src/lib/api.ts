export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export const apiRoutes = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    google: "/api/auth/google",
  },
  users: {
    me: "/api/users/me",
    byId: (id: string) => `/api/users/${id}`,
    profile: (id: string) => `/api/users/${id}/profile`,
  },
  readings: {
    list: "/api/readings",
    byId: (id: string) => `/api/readings/${id}`,
    questions: (id: string) => `/api/readings/${id}/questions`,
    submit: (id: string) => `/api/readings/${id}/submit`,
  },
  gamification: {
    profile: (userId: string) => `/api/gamification/profiles/${userId}`,
  },
  achievements: {
    byUser: (userId: string) => `/api/achievements/${userId}`,
    visibility: (achievementId: string, visible: boolean) =>
      `/api/achievements/${achievementId}/visibility?visible=${visible}`,
  },
  missions: {
    byUser: (userId: string) => `/api/missions/${userId}`,
    claim: (missionId: string) => `/api/missions/${missionId}/claim`,
  },
  clans: {
    list: "/api/clans",
    me: "/api/clans/me",
    create: "/api/clans",
    join: (id: string) => `/api/clans/${id}/join`,
    leave: (id: string) => `/api/clans/${id}/leave`,
    delete: (id: string) => `/api/clans/${id}`,
    leaderboard: "/api/clans/leaderboard",
    memberLeaderboard: (clanId: string) => `/api/clans/${clanId}/leaderboard`,
    buffs: (clanId: string) => `/api/clans/${clanId}/buffs`,
  },
  notifications: {
    byUser: (userId: string) => `/api/notifications/${userId}`,
    unreadCount: (userId: string) =>
      `/api/notifications/${userId}/unread-count`,
    read: (notificationId: string) =>
      `/api/notifications/read/${notificationId}`,
  },
  admin: {
    achievements: {
      list: "/api/admin/achievements",
      byId: (id: string) => `/api/admin/achievements/${id}`,
    },
    missions: {
      list: "/api/admin/missions",
      active: "/api/admin/missions/active",
      byId: (id: string) => `/api/admin/missions/${id}`,
      toggle: (id: string) => `/api/admin/missions/${id}/toggle`,
    },
    seasons: {
      list: "/api/admin/seasons",
      active: "/api/admin/seasons/active",
      end: (id: string) => `/api/admin/seasons/${id}/end`,
    },
    questions: {
      list: "/api/admin/questions",
      byId: (id: string) => `/api/admin/questions/${id}`,
      byReading: (readingId: string) =>
        `/api/admin/questions/reading/${readingId}`,
    },
  },
} as const;

export const apiErrorCodesByStatus = {
  400: "YOMU_API_400_BAD_REQUEST",
  401: "YOMU_API_401_UNAUTHORIZED",
  403: "YOMU_API_403_FORBIDDEN",
  404: "YOMU_API_404_NOT_FOUND",
  409: "YOMU_API_409_CONFLICT",
  500: "YOMU_API_500_SERVER_ERROR",
} as const;

export type ApiErrorCode =
  | (typeof apiErrorCodesByStatus)[keyof typeof apiErrorCodesByStatus]
  | "YOMU_API_UNKNOWN_ERROR"
  | "YOMU_NETWORK_ERROR";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number | null;
  endpoint: string;
  payload: unknown;

  constructor({
    code,
    message,
    status,
    endpoint,
    payload,
  }: {
    code: ApiErrorCode;
    message: string;
    status: number | null;
    endpoint: string;
    payload?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.endpoint = endpoint;
    this.payload = payload;
  }
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  displayName: string;
  role: "student" | "admin" | string;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: "student" | "admin" | string;
}

export interface StatsDTO {
  readingsCompleted: number;
  quizzesTaken: number;
  averageAccuracy: number;
}

export interface ProfileAchievementDTO {
  id: string;
  name: string;
  description?: string;
  milestone?: number;
  iconUrl?: string | null;
  unlockedAt: string | null;
  visible: boolean;
}

export interface UserProfileDTO {
  user: UserDTO;
  stats: StatsDTO;
  achievements: ProfileAchievementDTO[];
  clan: {
    id: string;
    name: string;
    tier: "bronze" | "silver" | "gold" | "diamond" | string;
    role: string;
  } | null;
}

export interface ReadingDTO {
  id: string;
  title: string;
  content: string;
  category: { id?: string | number; name: string } | null;
  createdAt?: string;
}

export interface QuestionDTO {
  id: string;
  questionText: string;
  options: string[];
}

export interface QuizResultDTO {
  score: number;
  accuracy: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface AchievementRow {
  id: string;
  name: string;
  description: string;
  milestone: number;
  iconUrl: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
  visible: boolean;
}

export interface MissionRow {
  id: string;
  title: string;
  description: string;
  targetType: string;
  targetCount: number;
  xpReward: number;
  progress: number | null;
  claimed: boolean | null;
  date: string | null;
}

export interface ClanBuff {
  buffType: string;
  multiplier: number;
  activatedAt: string;
  description: string;
}

export interface ClanRow {
  id: string;
  name: string;
  tier: "bronze" | "silver" | "gold" | "diamond" | string;
  totalScore: number;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  myRole?: string;
  currentTier?: string;
  previewTier?: string;
  willPromote?: boolean;
  willDemote?: boolean;
  buffs?: ClanBuff[];
}

export interface ClanBuffsResponse {
  clanId: string;
  buffs: ClanBuff[];
}

export interface ClanLeaderboardEntry {
  clanId: string;
  clanName: string;
  tier: string;
  totalScore: number;
  memberCount: number;
  multiplier: number;
  effectiveScore: number;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminAchievementDTO {
  id: string;
  name: string;
  description: string;
  milestone: number;
  iconUrl: string | null;
  type?: string;
  achievementType?: string;
  active?: boolean;
}

export interface AdminMissionDTO {
  id: string;
  title: string;
  description: string;
  targetType: string;
  targetCount: number;
  xpReward: number;
  active?: boolean;
  isActive?: boolean;
  date?: string;
}

export interface SeasonDTO {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string | null;
  isActive: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function nullableStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function normalizeUserProfile(
  payload: unknown,
  fallbackUser: Partial<UserDTO> = {},
): UserProfileDTO {
  const data = isRecord(payload) ? payload : {};
  const nestedUser = isRecord(data.user) ? data.user : {};
  const stats = isRecord(data.stats) ? data.stats : {};
  const achievementsSource = Array.isArray(data.achievements)
    ? data.achievements
    : Array.isArray(data.visibleAchievements)
      ? data.visibleAchievements
      : [];
  const clanSource = isRecord(data.clan)
    ? data.clan
    : isRecord(data.clanSummary)
      ? data.clanSummary
      : null;

  const user: UserDTO = {
    id: stringValue(nestedUser.id, stringValue(data.id, fallbackUser.id || "")),
    username: stringValue(
      nestedUser.username,
      stringValue(data.username, fallbackUser.username || ""),
    ),
    email: stringValue(nestedUser.email, fallbackUser.email || ""),
    phone:
      nullableStringValue(nestedUser.phone) ??
      nullableStringValue(fallbackUser.phone),
    displayName: stringValue(
      nestedUser.displayName,
      stringValue(data.displayName, fallbackUser.displayName || ""),
    ),
    role: stringValue(
      nestedUser.role,
      stringValue(data.role, fallbackUser.role || "student"),
    ),
  };

  return {
    user,
    stats: {
      readingsCompleted: numberValue(stats.readingsCompleted),
      quizzesTaken: numberValue(stats.quizzesTaken),
      averageAccuracy: numberValue(stats.averageAccuracy),
    },
    achievements: achievementsSource.filter(isRecord).map((achievement) => ({
      id: stringValue(achievement.id),
      name: stringValue(achievement.name),
      description: stringValue(achievement.description),
      milestone: numberValue(achievement.milestone),
      iconUrl: nullableStringValue(achievement.iconUrl),
      unlockedAt: nullableStringValue(achievement.unlockedAt),
      visible:
        typeof achievement.visible === "boolean" ? achievement.visible : true,
    })),
    clan: clanSource
      ? {
          id: stringValue(clanSource.id),
          name: stringValue(clanSource.name),
          tier: stringValue(clanSource.tier, "bronze"),
          role: stringValue(clanSource.role),
        }
      : null,
  };
}

interface ApiRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  token?: string | null;
  body?: unknown;
  headers?: HeadersInit;
}

function getErrorCode(status: number): ApiErrorCode {
  return (
    apiErrorCodesByStatus[status as keyof typeof apiErrorCodesByStatus] ||
    "YOMU_API_UNKNOWN_ERROR"
  );
}

function defaultMessageForStatus(status: number) {
  switch (status) {
    case 400:
      return "Request validation failed";
    case 401:
      return "Authentication is required";
    case 403:
      return "You are not allowed to perform this action";
    case 404:
      return "Requested resource was not found";
    case 409:
      return "Request conflicts with the current resource state";
    case 500:
      return "Server error";
    default:
      return "API request failed";
  }
}

async function readResponsePayload(response: Response) {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getPayloadMessage(payload: unknown) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const message =
    record.message || record.error || record.detail || record.title;

  return typeof message === "string" && message.trim() ? message : null;
}

function serializeBody(body: unknown, headers: Headers) {
  if (body === undefined) return undefined;

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return typeof body === "string" ? body : JSON.stringify(body);
}

export async function apiRequest<T = void>(
  endpoint: string,
  { token, body, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const serializedBody = serializeBody(body, requestHeaders);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: requestHeaders,
      body: serializedBody,
    });
  } catch (error) {
    throw new ApiError({
      code: "YOMU_NETWORK_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Network request could not be completed",
      status: null,
      endpoint,
      payload: error,
    });
  }

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    const code = getErrorCode(response.status);
    throw new ApiError({
      code,
      message:
        getPayloadMessage(payload) || defaultMessageForStatus(response.status),
      status: response.status,
      endpoint,
      payload,
    });
  }

  return payload as T;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function formatApiError(error: unknown, fallback: string) {
  if (isApiError(error)) {
    return `${error.message || fallback} [${error.code}]`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
