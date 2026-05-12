package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.service.AdminService;

@Configuration
public class DataInit {

    @Bean
    CommandLineRunner initData(AdminService adminService) {
        return args -> {
            // 관리자 계정이 없으면 초기 계정 생성
            if (!adminService.adminExists()) {
                adminService.createAdmin("vhxmvhffldh", "dlrjgozldehlskdy+1");
                System.out.println("✅ 초기 관리자 계정 생성 완료!");
                System.out.println("   ID: vhxmvhffldh");
                System.out.println("   Password: dlrjgozldehlskdy+1");
            } else {
                System.out.println("✅ 관리자 계정이 이미 존재합니다.");
            }
        };
    }
}