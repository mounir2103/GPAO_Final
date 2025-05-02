package com.solution.tp_gpao.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(securedEnabled = true)
@Slf4j
public class SecurityConfig {

    private final JwtFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final Environment env;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Log active profiles
        log.info("Active profiles: {}", Arrays.toString(env.getActiveProfiles()));
        
        // Configure security with explicit pattern matching
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(req -> {
                log.info("Configuring security patterns");
                
                // Allow public endpoints with multiple pattern options
                req.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                   .requestMatchers("/auth/**", "/api/v1/auth/**").permitAll()
                   .requestMatchers("/v2/api-docs/**", "/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui/**", "/webjars/**").permitAll();
                
                // Admin-only endpoints
                req.requestMatchers("/admin/**", "/api/v1/admin/**").hasRole("ADMIN");
                
                // Article endpoints with different role permissions
                req.requestMatchers(HttpMethod.GET, "/article/**", "/api/v1/article/**").hasAnyRole("USER", "EDITOR", "ADMIN")
                   .requestMatchers(HttpMethod.POST, "/article/**", "/api/v1/article/**").hasAnyRole("USER", "EDITOR", "ADMIN")
                   .requestMatchers(HttpMethod.PUT, "/article/**", "/api/v1/article/**").hasAnyRole("EDITOR", "ADMIN")
                   .requestMatchers(HttpMethod.DELETE, "/article/**", "/api/v1/article/**").hasAnyRole("USER", "ADMIN");
                
                // All other requests require authentication
                req.anyRequest().authenticated();
            })
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exception -> {
                exception.authenticationEntryPoint((request, response, authException) -> {
                    log.error("Authentication failed: {}", authException.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                });
                exception.accessDeniedHandler((request, response, accessDeniedException) -> {
                    log.error("Access denied: {}", accessDeniedException.getMessage());
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
                });
            });
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}