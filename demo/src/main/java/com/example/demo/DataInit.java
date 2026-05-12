package com.example.demo;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInit {

    @Bean
    CommandLineRunner initData(ProjectRepository repository) {
        return args -> {
            Project p = new Project();
            p.setTitle("나의 첫 포트폴리오");
            p.setTechStack("React, Spring Boot");
            p.setDescription("열심히 만드는 중입니다.");
            
            repository.save(p); // DB에 저장!
            System.out.println("데이터 저장 완료!");
        };
    }
}