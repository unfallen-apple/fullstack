package com.example.demo.entity; // 본인 패키지명에 맞게 수정하세요

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity // 이 클래스는 DB 테이블과 매핑되는 엔티티임을 선언
@Table(name = "project") // DB의 'project' 테이블과 연결
@Getter // Lombok: 모든 필드의 Getter를 자동으로 생성
@Setter // Lombok: 모든 필드의 Setter를 자동으로 생성
public class Project {

    @Id // 기본키(Primary Key) 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // MySQL의 AUTO_INCREMENT와 연동
    private Long id;

    @Column(nullable = false) // 필수 값 설정
    private String title;

    @Column(columnDefinition = "TEXT") // DB의 TEXT 타입과 매핑
    private String description;

    @Column(name = "tech_stack") // 자바는 카멜케이스(techStack), DB는 스네이크케이스(tech_stack)를 연결
    private String techStack;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 엔티티가 처음 저장될 때 시간을 자동으로 기록
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}