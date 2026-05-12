package com.example.demo.entity; // 본인 패키지명에 맞게 수정하세요

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Profile {
    @Id
    private Long id = 1L; // 프로필은 단 하나만 존재하므로 ID를 1로 고정합니다.
    private String name;
    private String role;
    @Column(columnDefinition = "TEXT")
    private String intro;
    private String github;
    private String blog;
    private String email;
    private String phone;
    private String profileImg;
}