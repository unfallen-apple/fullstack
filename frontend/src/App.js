import React, { useState, useEffect } from 'react';

function App() {
  // 1. 데이터를 담을 바구니(state) 만들기
  const [projects, setProjects] = useState([]);

  // 2. 화면이 켜지자마자 백엔드에 데이터 요청하기
  useEffect(() => {
    fetch("http://localhost:8080/api/projects") // 백엔드 창구 주소
      .then(response => response.json())      // 받아온 응답을 JSON으로 변환
      .then(data => {
        setProjects(data);                    // 변환된 데이터를 바구니에 담기
      })
      .catch(error => console.error("데이터를 가져오는데 실패했어요!", error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>내 포트폴리오 프로젝트 목록</h1>
      <hr />
      {/* 3. 바구니에 담긴 데이터를 하나씩 꺼내서 보여주기 */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {projects.map(project => (
          <div key={project.id} style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px',
            width: '250px'
          }}>
            <h3>{project.title}</h3>
            <p><strong>기술 스택:</strong> {project.techStack}</p>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;