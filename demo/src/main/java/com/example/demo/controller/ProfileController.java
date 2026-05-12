package com.example.demo.controller; // 본인의 패키지 경로에 맞게 수정

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.entity.Profile;
import com.example.demo.repository.ProfileRepository;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000") // 리액트 주소 허용
public class ProfileController {
    
    @Autowired
    private ProfileRepository profileRepository;

    @GetMapping
    public Profile getProfile() {
        // ID 1번 프로필을 찾고, 없으면 기본값이 채워진 새 프로필을 반환합니다.
        return profileRepository.findById(1L).orElseGet(() -> {
            Profile defaultProfile = new Profile();
            defaultProfile.setId(1L);
            defaultProfile.setName("이름을 입력하세요");
            defaultProfile.setRole("직무를 입력하세요");
            defaultProfile.setIntro("자기소개를 입력하세요.");
            return profileRepository.save(defaultProfile);
        });
    }

    @PutMapping
    public Profile updateProfile(@RequestBody Profile profile) {
        profile.setId(1L); // 무조건 1번만 업데이트하도록 보장
        return profileRepository.save(profile);
    }

    @PostMapping("/{id}/upload")
    public Profile uploadProfileImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로필을 찾을 수 없습니다."));

        // 프로젝트 업로드와 동일한 위치에 저장하도록 통일
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path dest = uploadPath.resolve(fileName);
        Files.write(dest, file.getBytes());

        profile.setProfileImg("/uploads/" + fileName);
        return profileRepository.save(profile);
    }
}