import React, { useState, useEffect } from 'react';

function App() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchProjects = () => {
    fetch("http://localhost:8080/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = { title, techStack, description };
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `http://localhost:8080/api/projects/${editingId}` : "http://localhost:8080/api/projects";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData)
    })
    .then(() => {
      alert(editingId ? "수정 성공!" : "등록 성공!");
      resetForm();
      fetchProjects();
    });
  };

  // 버그 수정 1: 삭제 함수(handleDelete)가 정확히 구현되었는지 확인
  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`http://localhost:8080/api/projects/${id}`, {
        method: "DELETE",
      })
      .then(() => {
        alert("삭제되었습니다.");
        fetchProjects(); // 목록 새로고침
      })
      .catch(err => console.error("삭제 실패:", err));
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setTechStack(p.techStack);
    setDescription(p.description);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setTechStack(''); setDescription('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>내 포트폴리오 관리</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px', border: '2px solid blue', padding: '20px' }}>
        <h3>{editingId ? "프로젝트 수정 중..." : "새 프로젝트 추가"}</h3>
        <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required /><br/>
        <input type="text" placeholder="기술 스택" value={techStack} onChange={(e) => setTechStack(e.target.value)} /><br/>
        <textarea placeholder="설명" value={description} onChange={(e) => setDescription(e.target.value)} /><br/>
        <button type="submit">{editingId ? "수정 완료" : "등록하기"}</button>
        {editingId && <button onClick={resetForm} type="button">취소</button>}
      </form>

      <hr />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {projects.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', width: '250px' }}>
            <h4>{p.title}</h4>
            <p><strong>기술 스택:</strong> {p.techStack}</p>
            {/* 버그 수정 2: 설명(description) 항목이 빠져있었는지 확인 */}
            <p style={{ backgroundColor: '#f9f9f9', padding: '5px' }}>{p.description}</p> 
            
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => startEdit(p)} style={{ marginRight: '5px' }}>수정</button>
              <button onClick={() => handleDelete(p.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none' }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;