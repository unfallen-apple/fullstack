package com.example.demo.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.service.AdminService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private AdminService adminService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults());
        http.csrf(csrf -> csrf.disable());

        http.authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/profile", "/api/projects/**", "/uploads/**", "/actuator/health", "/actuator/info").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/**").hasRole("ADMIN")
            .anyRequest().permitAll()
        );

        http.httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // UserDetailsService는 AdminService가 구현함 (DB 기반)
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // IMPORTANT: CORS only accepts exact origins (not wildcard patterns like https://*.vercel.app).
        // Use exact frontend domain(s) separated by commas, or set FRONTEND_URL env var.
        String frontendEnv = System.getenv("FRONTEND_URL");
        if (frontendEnv == null || frontendEnv.isBlank()) {
            // Default: local dev + fixed production Vercel custom domain
            frontendEnv = "http://localhost:3000,https://junyoungkim.vercel.app";
        }
        String[] origins = frontendEnv.split("\\s*,\\s*");
        java.util.List<String> allowed = new java.util.ArrayList<>();
        for (String o : origins) {
            String v = o.trim();
            if (v.isEmpty()) continue;
            // If scheme missing, assume https
            if (!v.startsWith("http://") && !v.startsWith("https://")) {
                v = "https://" + v;
            }
            allowed.add(v);
        }

        System.out.println("[CORS Config] Allowed origins: " + allowed);
        configuration.setAllowedOrigins(allowed);  // Use setAllowedOrigins for exact matching
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
