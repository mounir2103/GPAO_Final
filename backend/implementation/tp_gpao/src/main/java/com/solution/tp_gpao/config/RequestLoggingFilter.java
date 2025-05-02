package com.solution.tp_gpao.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        // Log detailed request information before any security processing
        log.info("===== Request Details =====");
        log.info("Method: {}", request.getMethod());
        log.info("RequestURI: {}", request.getRequestURI());
        log.info("ContextPath: {}", request.getContextPath());
        log.info("ServletPath: {}", request.getServletPath());
        log.info("PathInfo: {}", request.getPathInfo());
        
        // Log headers
        log.info("=== Headers ===");
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames != null && headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            // Mask sensitive headers like Authorization
            if ("authorization".equalsIgnoreCase(headerName) && headerValue != null) {
                headerValue = headerValue.startsWith("Bearer ") ? "Bearer [MASKED]" : "[MASKED]";
            }
            headers.put(headerName, headerValue);
        }
        log.info("Headers: {}", headers);

        // Continue with the filter chain
        try {
            filterChain.doFilter(request, response);
        } finally {
            // Log response status
            log.info("Response Status: {}", response.getStatus());
        }
    }
}