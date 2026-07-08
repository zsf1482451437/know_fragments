package handler

import (
	"encoding/json"
	"net/http"

	"ecommerce-system/backend/internal/middleware"
)

type envelope[T any] struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	Data      T      `json:"data"`
	RequestID string `json:"requestId"`
}

func writeOK[T any](writer http.ResponseWriter, request *http.Request, data T) {
	writeJSON(writer, request, http.StatusOK, "OK", "success", data)
}

func writeError(writer http.ResponseWriter, request *http.Request, status int, code string, message string) {
	writeJSON(writer, request, status, code, message, map[string]any{})
}

func writeJSON[T any](
	writer http.ResponseWriter,
	request *http.Request,
	status int,
	code string,
	message string,
	data T,
) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	requestID, _ := request.Context().Value(middleware.RequestIDKey{}).(string)
	_ = json.NewEncoder(writer).Encode(envelope[T]{
		Code:      code,
		Message:   message,
		Data:      data,
		RequestID: requestID,
	})
}
