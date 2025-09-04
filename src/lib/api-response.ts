import { NextResponse } from 'next/server'
import { ApiResponse, ApiError } from '@/types/api'

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): NextResponse {
    const response: ApiResponse<T> & { success: boolean } = {
      success: true,
      data,
      message,
      status: 'success',
      timestamp: new Date().toISOString()
    }
    return NextResponse.json(response)
  }

  static error(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ): NextResponse {
    const error: ApiError = {
      code: code || `ERROR_${statusCode}`,
      message,
      details,
      timestamp: new Date().toISOString()
    }

    const response: ApiResponse<null> & { success: boolean } = {
      success: false,
      error: error.message,
      status: 'error',
      timestamp: error.timestamp
    }

    return NextResponse.json(response, { status: statusCode })
  }

  static validationError(
    message: string,
    details?: Record<string, unknown>
  ): NextResponse {
    return this.error(message, 400, 'VALIDATION_ERROR', details)
  }

  static notFound(resource: string = 'Resource'): NextResponse {
    return this.error(`${resource} not found`, 404, 'NOT_FOUND')
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return this.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message: string = 'Forbidden'): NextResponse {
    return this.error(message, 403, 'FORBIDDEN')
  }

  static serverError(message: string = 'Internal server error'): NextResponse {
    return this.error(message, 500, 'INTERNAL_ERROR')
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return ApiResponseBuilder.serverError(error.message)
  }
  
  return ApiResponseBuilder.serverError()
}
