package com.solution.tp_gpao.auth;

import com.solution.tp_gpao.auth.AuthRequest;
import com.solution.tp_gpao.auth.AuthResponse;
import com.solution.tp_gpao.auth.RegisterRequest;
import com.solution.tp_gpao.roles.Role;
import com.solution.tp_gpao.roles.RoleRepository;
import com.solution.tp_gpao.users.User;
import com.solution.tp_gpao.users.UserRepository;
import com.solution.tp_gpao.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());
        
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("User already exists: {}", request.getEmail());
            throw new RuntimeException("User already exists with email: " + request.getEmail());
        }
        
        // Get or create ROLE_USER
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(List.of(userRole))
                .enabled(true)
                .accountLocked(false)
                .createdDate(LocalDateTime.now())
                .build();
        
        userRepository.save(user);
        log.info("User registered successfully: {}", request.getEmail());
        
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .role(user.getRoles().get(0).getName())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        log.info("Authenticating user: {}", request.getEmail());
        
        // This will throw if authentication fails
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        var jwtToken = jwtService.generateToken(user);
        log.info("User authenticated successfully: {}", request.getEmail());
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .role(user.getRoles().get(0).getName())
                .build();
    }
}