package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // 텅 비어있어도 됩니다. JpaRepository가 기본적인 저장, 수정, 삭제, 조회 기능을 다 제공하거든요!
}