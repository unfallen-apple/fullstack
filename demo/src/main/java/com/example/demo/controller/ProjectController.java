package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;

@RestController // 이 클래스가 JSON 데이터를 주고받는 창구임을 선언
@CrossOrigin(origins = "http://localhost:3000") // 리액트에서 오는 요청을 허용해줘!
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

    // 새로운 프로젝트 저장 (Create)
    @PostMapping
    public Project createProject(@RequestBody Project project) {
    // @RequestBody는 리액트가 보낸 JSON 데이터를 자바 객체로 변환해줍니다.
    return projectRepository.save(project);
    }

    // 특정 프로젝트 삭제 (Delete)
    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        // URL에 포함된 id 값을 가져와서 삭제를 수행합니다.
        projectRepository.deleteById(id);
    }

    // 기존 프로젝트 수정 (Update)
    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        // 1. 일단 DB에서 해당 데이터를 찾습니다.
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 프로젝트가 없어요!"));

        // 2. 새로운 내용으로 덮어씌웁니다.
        project.setTitle(projectDetails.getTitle());
        project.setTechStack(projectDetails.getTechStack());
        project.setDescription(projectDetails.getDescription());

        // 3. 다시 저장(업데이트)합니다.
        return projectRepository.save(project);
    }
    }

