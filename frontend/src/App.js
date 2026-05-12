import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function App() {
  const [projects, setProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 1. 서버에서 관리될 프로필 정보 상태
  const [myInfo, setMyInfo] = useState({
    name: "", role: "", intro: "", github: "", blog: "", email: "", phone: "", profileImg: ""
  });

  // 프로젝트 등록/수정 폼 상태
  const [formData, setFormData] = useState({
    title: '', techStack: '', description: '', linkUrl: '', longDescription: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail, setShowDetail] = useState(null); 

  // 데이터 로딩 (프로필 & 프로젝트)
  const fetchData = () => {
    // 프로필 정보 가져오기
    fetch("http://localhost:8080/api/profile")
      .then(res => res.json())
      .then(data => setMyInfo(data))
      .catch(err => console.error("프로필 로딩 실패:", err));

    // 프로젝트 목록 가져오기
    fetch("http://localhost:8080/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data.sort((a, b) => a.seq - b.seq)))
      .catch(err => console.error("프로젝트 로딩 실패:", err));
  };

  useEffect(() => { fetchData(); }, []);

  // 프로필 정보 저장 핸들러
  const handleProfileSave = () => {
    fetch("http://localhost:8080/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(myInfo)
    })
    .then(res => res.json())
    .then(() => alert("프로필 정보가 서버에 저장되었습니다."));
  };

  // 프로젝트 순서 변경 핸들러
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setProjects(items);

    const idList = items.map(p => p.id);
    fetch("http://localhost:8080/api/projects/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idList)
    });
  };

  // 프로젝트 저장 (등록/수정)
  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `http://localhost:8080/api/projects/${editingId}` : "http://localhost:8080/api/projects";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(saved => {
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        fetch(`http://localhost:8080/api/projects/${saved.id}/upload`, { method: "POST", body: fileData })
          .then(() => { alert("저장 완료!"); finishSubmit(); });
      } else {
        alert("저장 완료!");
        finishSubmit();
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`http://localhost:8080/api/projects/${id}`, { method: "DELETE" }).then(() => fetchData());
    }
  };

  const finishSubmit = () => {
    setFormData({ title: '', techStack: '', description: '', linkUrl: '', longDescription: '' });
    setEditingId(null); setSelectedFile(null); fetchData();
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* 네비게이션 */}
      <nav className="navbar navbar-dark bg-dark sticky-top shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">🚀 ADMIN PORTFOLIO</span>
          <button className={`btn btn-sm ${isAdmin ? 'btn-success' : 'btn-outline-light'}`} onClick={() => setIsAdmin(!isAdmin)}>
            {isAdmin ? "🔓 관리자 모드 ON" : "🔒 보기 모드"}
          </button>
        </div>
      </nav>

      {/* 히어로 섹션 (프로필 편집 포함) */}
      <header className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-3 text-center mb-4 mb-md-0">
              <img 
                src={myInfo.profileImg || "https://via.placeholder.com/180"} 
                alt="Profile" 
                className="rounded-circle shadow border border-5 border-light" 
                style={{ width: '180px', height: '180px', objectFit: 'cover' }}
              />
            </div>
            <div className="col-md-9">
              {isAdmin ? (
                <div className="p-3 border rounded bg-light">
                  <h6 className="fw-bold mb-3">👤 프로필 정보 수정</h6>
                  <div className="row g-2">
                    <div className="col-md-6"><input className="form-control" value={myInfo.name} onChange={e => setMyInfo({...myInfo, name: e.target.value})} placeholder="이름" /></div>
                    <div className="col-md-6"><input className="form-control" value={myInfo.role} onChange={e => setMyInfo({...myInfo, role: e.target.value})} placeholder="직무 (예: Full-stack Developer)" /></div>
                    <div className="col-12"><textarea className="form-control" rows="2" value={myInfo.intro} onChange={e => setMyInfo({...myInfo, intro: e.target.value})} placeholder="자기소개 한마디" /></div>
                    <div className="col-md-4"><input className="form-control" value={myInfo.github} onChange={e => setMyInfo({...myInfo, github: e.target.value})} placeholder="GitHub 링크" /></div>
                    <div className="col-md-4"><input className="form-control" value={myInfo.blog} onChange={e => setMyInfo({...myInfo, blog: e.target.value})} placeholder="Blog 링크" /></div>
                    <div className="col-md-4"><button className="btn btn-primary w-100 fw-bold" onClick={handleProfileSave}>💾 프로필 저장</button></div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-md-start">
                  <h1 className="fw-bold text-dark mb-1">{myInfo.name || "이름을 등록하세요"}</h1>
                  <h4 className="text-primary fw-normal mb-3">{myInfo.role || "직무를 등록하세요"}</h4>
                  <p className="text-secondary mb-4" style={{ maxWidth: '700px', lineHeight: '1.8', fontSize: '1.1rem' }}>
                    {myInfo.intro || "자기소개가 없습니다."}
                  </p>
                  <div className="d-flex gap-2 justify-content-center justify-content-md-start">
                    {myInfo.github && <a href={myInfo.github} target="_blank" rel="noreferrer" className="btn btn-dark px-4 shadow-sm">GitHub</a>}
                    {myInfo.blog && <a href={myInfo.blog} target="_blank" rel="noreferrer" className="btn btn-outline-primary px-4 shadow-sm">Blog</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="container flex-grow-1">
        {/* 프로젝트 관리 폼 */}
        {isAdmin && (
          <div className="card shadow-sm mb-5 border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white fw-bold">📦 프로젝트 관리</div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4"><input type="text" className="form-control" placeholder="프로젝트 제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div className="col-md-4"><input type="text" className="form-control" placeholder="기술 스택 (쉼표 구분)" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} /></div>
                <div className="col-md-4"><input type="url" className="form-control" placeholder="프로젝트 링크" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} /></div>
                <div className="col-12"><textarea className="form-control" placeholder="카드용 짧은 요약" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                <div className="col-12"><textarea className="form-control" rows="3" placeholder="팝업용 상세 설명" value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} /></div>
                <div className="col-md-6"><input type="file" className="form-control" onChange={e => setSelectedFile(e.target.files[0])} /></div>
                <div className="col-12"><button type="submit" className="btn btn-primary px-5 fw-bold">프로젝트 저장</button></div>
              </form>
            </div>
          </div>
        )}

        <h3 className="fw-bold mb-4">📂 Projects</h3>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects-grid" direction="horizontal">
            {(provided) => (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4" {...provided.droppableProps} ref={provided.innerRef}>
                {projects.map((p, index) => (
                  <Draggable key={p.id} draggableId={String(p.id)} index={index} isDragDisabled={!isAdmin}>
                    {(provided, snapshot) => (
                      <div className="col" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${snapshot.isDragging ? 'shadow-lg ring' : ''}`} style={{ transition: '0.3s' }}>
                          <div style={{ height: '160px', backgroundColor: '#eee' }}>
                            {p.imageUrl ? <img src={`http://localhost:8080${p.imageUrl}`} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" /> : <div className="d-flex align-items-center justify-content-center h-100 text-muted">No Image</div>}
                          </div>
                          <div className="card-body p-3 d-flex flex-column">
                            <h6 className="card-title fw-bold mb-2">{p.title}</h6>
                            <div className="mb-2 d-flex flex-wrap gap-1">
                              {p.techStack && p.techStack.split(',').map((s, i) => (
                                <span key={i} className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle" style={{fontSize: '0.65rem'}}>#{s.trim()}</span>
                              ))}
                            </div>
                            <p className="card-text text-muted mb-3" style={{ fontSize: '0.85rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                            <div className="d-flex gap-2">
                              <button className="btn btn-dark btn-sm flex-fill" onClick={() => setShowDetail(p)}>자세히 보기</button>
                              {p.linkUrl && <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm flex-fill">링크</a>}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="card-footer bg-white border-0 d-flex gap-1 pb-3 px-3">
                              <button className="btn btn-light btn-sm flex-grow-1 border" onClick={() => { setEditingId(p.id); setFormData(p); window.scrollTo(0,0); }}>수정</button>
                              <button className="btn btn-light text-danger btn-sm flex-grow-1 border" onClick={() => handleDelete(p.id)}>삭제</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {/* 푸터 (연락처 편집 포함) */}
      <footer className="bg-dark text-white py-5 mt-5">
        <div className="container text-center">
          <h4 className="fw-bold mb-4">Contact Me</h4>
          <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
            {isAdmin ? (
              <div className="row g-2" style={{maxWidth: '500px'}}>
                <div className="col-6"><input className="form-control form-control-sm bg-dark text-white border-secondary" value={myInfo.email} onChange={e => setMyInfo({...myInfo, email: e.target.value})} placeholder="이메일" /></div>
                <div className="col-6"><input className="form-control form-control-sm bg-dark text-white border-secondary" value={myInfo.phone} onChange={e => setMyInfo({...myInfo, phone: e.target.value})} placeholder="전화번호" /></div>
              </div>
            ) : (
              <>
                <div className="bg-secondary bg-opacity-25 px-4 py-2 rounded-pill">
                  <small className="text-secondary d-block" style={{fontSize: '0.7rem'}}>EMAIL</small>
                  <span className="fw-bold">{myInfo.email || "미등록"}</span>
                </div>
                <div className="bg-secondary bg-opacity-25 px-4 py-2 rounded-pill">
                  <small className="text-secondary d-block" style={{fontSize: '0.7rem'}}>PHONE</small>
                  <span className="fw-bold">{myInfo.phone || "미등록"}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-secondary small mb-0">© 2026 {myInfo.name || "Owner"}. All rights reserved.</p>
        </div>
      </footer>

      {/* 상세 보기 모달 */}
      {showDetail && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0"><h5 className="modal-title fw-bold">{showDetail.title}</h5><button className="btn-close" onClick={() => setShowDetail(null)}></button></div>
              <div className="modal-body p-4 pt-0">
                <div className="mb-3 d-flex flex-wrap gap-1">
                  {showDetail.techStack && showDetail.techStack.split(',').map((s, i) => (
                    <span key={i} className="badge bg-primary">#{s.trim()}</span>
                  ))}
                </div>
                <div className="bg-light p-4 rounded-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{showDetail.longDescription || "상세 설명이 없습니다."}</div>
              </div>
              <div className="modal-footer border-0"><button className="btn btn-secondary px-4" onClick={() => setShowDetail(null)}>닫기</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;