package com.example.demo.controller; // 본인의 패키지 경로에 맞게 수정

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
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
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        // If Supabase env vars are present, upload to Supabase Storage and set public URL.
        String supabaseUrl = System.getenv("SUPABASE_URL");
        String supabaseKey = System.getenv("SUPABASE_KEY");
        String supabaseBucket = System.getenv("SUPABASE_BUCKET");
        if (supabaseUrl != null && supabaseKey != null && supabaseBucket != null) {
            try {
                // Upload via PUT to /storage/v1/object/{bucket}/{path}
                String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
                URI uri = URI.create(supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + encodedName);
                HttpRequest req = HttpRequest.newBuilder(uri)
                        .header("Authorization", "Bearer " + supabaseKey)
                        .header("x-upsert", "true")
                        .header("Content-Type", file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                        .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                        .build();
                HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.discarding());
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + encodedName;
                profile.setProfileImg(publicUrl);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException(e);
            }
        } else {
            // Fallback to local filesystem (non-persistent on ephemeral hosts)
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            Path dest = uploadPath.resolve(fileName);
            Files.write(dest, file.getBytes());
            profile.setProfileImg("/uploads/" + fileName);
        }
        return profileRepository.save(profile);
    }
}