package com.taskmanager.exception;

import com.taskmanager.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errorList = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            Map<String, String> errMap = new HashMap<>();
            errMap.put("type", "field");
            errMap.put("value", fieldError.getRejectedValue() != null ? fieldError.getRejectedValue().toString() : "");
            errMap.put("msg", fieldError.getDefaultMessage());
            errMap.put("path", fieldError.getField());
            errMap.put("location", "body");
            errorList.add(errMap);
        }

        ApiResponse<Object> apiResponse = ApiResponse.validationError("Validation failed", errorList);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        String msg = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;
        
        if (msg.contains("Invalid email") || msg.contains("Invalid username") || msg.contains("token") || msg.contains("User not found")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (msg.contains("Task not found")) {
            status = HttpStatus.NOT_FOUND;
        }

        ApiResponse<Object> apiResponse = new ApiResponse<>(false, msg);
        return ResponseEntity.status(status).body(apiResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception ex) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(false, ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
    }
}
