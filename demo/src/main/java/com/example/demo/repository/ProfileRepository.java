package com.example.demo.repository; // 본인의 패키지 경로에 맞게 수정

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Profile;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
}