package com.expo.sales.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(AdminAuthenticationException.class)
    ResponseEntity<?> unauthorized(AdminAuthenticationException e){ return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage())); }
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<?> badRequest(IllegalArgumentException e){ return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e){
        String msg=e.getBindingResult().getFieldErrors().stream().findFirst().map(x->x.getField()+": "+x.getDefaultMessage()).orElse("Validation failed");
        return ResponseEntity.badRequest().body(Map.of("message",msg));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> generic(Exception e){ return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Internal server error")); }
}
