package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/정진석 바보")
    public String hello() {
        return "드디어 DB랑 백엔드 연동 했잖슴? 아 bammm";
    }
} 