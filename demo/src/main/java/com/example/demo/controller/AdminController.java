package com.example.demo.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/verify")
    public Map<String, String> verify(Principal principal) {
        Map<String, String> result = new HashMap<>();
        result.put("user", principal.getName());
        result.put("status", "ok");
        return result;
    }
}
