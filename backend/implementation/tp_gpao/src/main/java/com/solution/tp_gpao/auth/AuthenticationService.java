package com.solution.tp_gpao.auth;

import com.solution.tp_gpao.roles.RoleRepository;
import com.solution.tp_gpao.security.JwtService;
import com.solution.tp_gpao.users.UserRepository;
import com.solution.tp_gpao.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final RoleRepository roleRepository ;
    private final PasswordEncoder passwordEncoder ;
    private final UserRepository userRepository ;
    private final AuthenticationManager authenticationManager ;
    private final JwtService jwtService ;


    public void register(RegistrationRequest request) {
        var userRole = roleRepository.findByName("USER")
                .orElseThrow(()-> new IllegalStateException("User Role not found or not initialized"));
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountLocked(false)
                .enabled(true)
                .createdDate(LocalDateTime.now())
                .roles(List.of(userRole))
                .build();
        userRepository.save(user);

    }

    public AuthenticationResponse authenticate(@Valid AuthenticationRequest request) {

        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var claims = new HashMap<String , Object>();
        var user = ((User) auth.getPrincipal());
        claims.put("fullName", user.fullName());
        var jwtToken = jwtService.generateToken(claims , user);
        return AuthenticationResponse.builder()
                .token(jwtToken )
                .build();
    }

}
