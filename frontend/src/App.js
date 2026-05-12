import React, { useState, useEffect } from 'react';

function App() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // [추가] 파일 선택 상태를 관리하기 위한 변수
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProjects = () => {
    fetch("http://localhost:8080/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
  };

  useEffect(() => { fetchProjects(); }, []);

  // [추가] 파일 선택 시 상태 업데이트 함수
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = { title, techStack, description };
    
    // 수정이면 PUT, 등록이면 POST
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `http://localhost:8080/api/projects/${editingId}` : "http://localhost:8080/api/projects";

    // 1단계: 텍스트 정보 먼저 서버에 저장
    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData)
    })
    .then(res => res.json())
    .then(savedProject => {
      // 2단계: 저장된 프로젝트의 ID를 받아온 후, 파일이 있다면 이미지 업로드 진행
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile); // 서버의 @RequestParam("file")과 이름이 같아야 함

        fetch(`http://localhost:8080/api/projects/${savedProject.id}/upload`, {
          method: "POST",
          body: formData // 파일은 JSON이 아니라 FormData로 보냄
        })
        .then(() => {
          alert(editingId ? "수정 및 이미지 업로드 완료!" : "이미지 포함 등록 완료!");
          finishSubmit();
        });
      } else {
        alert(editingId ? "수정 완료!" : "등록 완료!");
        finishSubmit();
      }
    })
    .catch(err => console.error("오류 발생:", err));
  };

  const finishSubmit = () => {
    resetForm();
    fetchProjects();
    setSelectedFile(null); // 파일 선택 초기화
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`http://localhost:8080/api/projects/${id}`, { method: "DELETE" })
      .then(() => {
        alert("삭제되었습니다.");
        fetchProjects();
      });
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setTechStack(p.techStack);
    setDescription(p.description);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setTechStack(''); setDescription('');
    setSelectedFile(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          style={{
            backgroundColor: isAdmin ? '#4CAF50' : '#666',
            color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          {isAdmin ? "🔓 관리자 모드 ON" : "🔒 일반 사용자 모드"}
        </button>
      </div>

      <h1 style={{ textAlign: 'center', color: '#333' }}>My Portfolio</h1>
      
      {isAdmin && (
        <div style={{ backgroundColor: '#f4f7f6', padding: '20px', borderRadius: '10px', marginBottom: '40px', border: '1px dashed #4CAF50' }}>
          <h2>{editingId ? "🛠️ 프로젝트 수정" : "➕ 새 프로젝트 추가"}</h2>
          <form onSubmit={handleSubmit}>
            <input 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
              type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required 
            /><br/>
            <input 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
              type="text" placeholder="기술 스택" value={techStack} onChange={(e) => setTechStack(e.target.value)} 
            /><br/>
            
            {/* [추가] 이미지 첨부 버튼 */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>프로젝트 대표 이미지:</label>
              <input type="file" onChange={handleFileChange} accept="image/*" />
            </div>

            <textarea 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '100px', boxSizing: 'border-box' }}
              placeholder="설명" value={description} onChange={(e) => setDescription(e.target.value)} 
            /><br/>
            
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {editingId ? "수정 완료" : "등록하기"}
            </button>
            {editingId && <button onClick={resetForm} type="button" style={{ marginLeft: '10px' }}>취소</button>}
          </form>
        </div>
      )}

      <hr style={{ margin: '40px 0', border: '0.5px solid #eee' }} />

      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {projects.map(p => (
          <div key={p.id} style={{ 
            border: '1px solid #ddd', padding: '20px', width: '300px', borderRadius: '15px', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)', backgroundColor: 'white', overflow: 'hidden'
          }}>
            {/* [추가] 이미지가 있다면 출력 */}
            {p.imageUrl && (
              <img 
                src={`http://localhost:8080${p.imageUrl}`} 
                alt="project" 
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} 
              />
            )}
            
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{p.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#16a085', fontWeight: 'bold' }}>#{p.techStack}</p>
            <p style={{ color: '#666', lineHeight: '1.6' }}>{p.description}</p>
            
            {isAdmin && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button onClick={() => startEdit(p)} style={{ flex: 1, padding: '7px', cursor: 'pointer' }}>수정</button>
                <button onClick={() => handleDelete(p.id)} style={{ flex: 1, padding: '7px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;