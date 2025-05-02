package com.solution.tp_gpao.auth;

import com.solution.tp_gpao.auth.AuthRequest;
import com.solution.tp_gpao.auth.AuthResponse;
import com.solution.tp_gpao.auth.RegisterRequest;
import com.solution.tp_gpao.auth.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")  // Changed from /api/v1/auth to /auth since /api/v1 is already in the context path
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("User with this email already exists"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred during registration"));
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.authenticate(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid credentials"));
        }
    }
    
    // For debugging - access this endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        log.info("Test endpoint accessed");
        return ResponseEntity.ok("Auth controller is working!");
    }

    @Data
    @AllArgsConstructor
    private static class ErrorResponse {
        private String message;
    }
}