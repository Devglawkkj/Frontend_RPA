import { AxiosError } from "axios"

// FastAPI commonly returns errors as { detail: string } or, for validation
// errors, { detail: [{ loc, msg, type }] }. This normalizes both shapes into a
// single human-readable message in Portuguese.

export interface FastApiValidationItem {
  loc: (string | number)[]
  msg: string
  type: string
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string") return detail

    if (Array.isArray(detail)) {
      return (detail as FastApiValidationItem[])
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ")
    }

    if (error.code === "ERR_NETWORK") {
      return "Não foi possível conectar ao servidor. Verifique sua conexão."
    }

    if (error.response?.status === 401) {
      return "Sessão expirada. Faça login novamente."
    }

    if (error.response?.status === 403) {
      return "Você não tem permissão para realizar esta ação."
    }

    if (error.response?.status === 404) {
      return "Recurso não encontrado."
    }

    if (error.response?.status === 500) {
      return "Erro interno do servidor. Tente novamente mais tarde."
    }

    return error.message
  }

  if (error instanceof Error) return error.message

  return "Ocorreu um erro inesperado."
}
