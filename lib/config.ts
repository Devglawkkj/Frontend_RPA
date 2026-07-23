export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  // Mocks are enabled by default so the dashboard is fully navigable without a
  // running FastAPI backend. Set NEXT_PUBLIC_USE_MOCKS=false to hit the real API.
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",
} as const

export const TOKEN_STORAGE_KEY = "rpa_dashboard_token"
