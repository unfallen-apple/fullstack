package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;

@RestController // 이 클래스가 JSON 데이터를 주고받는 창구임을 선언
@RequestMapping("/api/projects") // 이 주소로 들어오는 요청을 처리함
public class ProjectController {

    private final ProjectRepository projectRepository;

    // 생성자를 통해 레포지토리(일꾼)를 주입받음
    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping // GET 방식으로 요청이 오면 실행
    public List<Project> getAllProjects() {
        return projectRepository.findAll(); // DB에 있는 모든 프로젝트를 가져와서 반환!
    }
}