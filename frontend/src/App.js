import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // --- [상태 관리] ---
  const [projects, setProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authHeader, setAuthHeader] = useState(null);
  
  // 프로필 관련 상태
  const [myInfo, setMyInfo] = useState({
    name: "", role: "", intro: "", github: "", blog: "", email: "", phone: "", profileImg: ""
  });
  const [profileFile, setProfileFile] = useState(null); // 실제 업로드할 파일
  const [profilePreview, setProfilePreview] = useState(null); // 브라우저 미리보기 URL

  // 프로젝트 관련 상태
  const [formData, setFormData] = useState({
    title: '', techStack: '', description: '', linkUrl: '', longDescription: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail, setShowDetail] = useState(null); 

  // --- [데이터 가져오기] ---
  const fetchData = () => {
    // 프로필 정보 로드
    fetch(`${API_BASE_URL}/api/profile`)
      .then(res => res.json())
      .then(data => setMyInfo(data))
      .catch(err => console.error("프로필 로드 실패:", err));

    // 프로젝트 목록 로드 (순서 정렬)
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data.sort((a, b) => a.seq - b.seq)))
      .catch(err => console.error("프로젝트 로드 실패:", err));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setAuthHeader(null);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const header = 'Basic ' + btoa(adminUser + ':' + adminPass);
    fetch(`${API_BASE_URL}/api/admin/verify`, { headers: { Authorization: header } })
      .then(res => {
        if (res.ok) {
          setIsAdmin(true);
          setAuthHeader(header);
          setShowLoginModal(false);
          setAdminUser(''); setAdminPass('');
        } else {
          alert('인증에 실패했습니다. 계정 정보를 확인하세요.');
        }
      })
      .catch(err => { console.error(err); alert('인증 에러'); });
  };

  // --- [프로필 관리 로직] ---
  
  // 프로필 사진 선택 시 미리보기 생성
  const onProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file)); // 임시 URL 생성
    }
  };

  // 프로필 정보 + 사진 저장
  const handleProfileSave = () => {
    // 1. 텍스트 정보 먼저 업데이트
    const authHeaders = authHeader ? { Authorization: authHeader } : {};
    fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(myInfo)
    })
    .then(res => res.json())
    .then(savedProfile => {
      // 2. 선택된 사진 파일이 있으면 업로드 실행
      if (profileFile) {
        const fileData = new FormData();
        fileData.append("file", profileFile);
        fetch(`${API_BASE_URL}/api/profile/${savedProfile.id}/upload`, {
          method: "POST",
          headers: authHeader ? { Authorization: authHeader } : {},
          body: fileData
        })
        .then(res => res.json())
        .then(finalData => {
          setMyInfo(finalData); // 최종 데이터(이미지 경로 포함) 반영
          setProfileFile(null);
          setProfilePreview(null);
          alert("프로필 정보와 사진이 저장되었습니다! ✨");
        });
      } else {
        alert("프로필 정보가 저장되었습니다! ✅");
      }
    });
  };

  // --- [프로젝트 관리 로직] ---

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setProjects(items);

    const idList = items.map(p => p.id);
    fetch(`${API_BASE_URL}/api/projects/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(authHeader ? { Authorization: authHeader } : {}) },
      body: JSON.stringify(idList)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE_URL}/api/projects/${editingId}` : `${API_BASE_URL}/api/projects`;

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json", ...(authHeader ? { Authorization: authHeader } : {}) },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(saved => {
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        fetch(`${API_BASE_URL}/api/projects/${saved.id}/upload`, { method: "POST", headers: authHeader ? { Authorization: authHeader } : {}, body: fileData })
          .then(() => { alert("프로젝트 저장 완료!"); finishSubmit(); });
      } else {
        alert("프로젝트 저장 완료!");
        finishSubmit();
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`${API_BASE_URL}/api/projects/${id}`, { method: "DELETE", headers: authHeader ? { Authorization: authHeader } : {} }).then(() => fetchData());
    }
  };

  const finishSubmit = () => {
    setFormData({ title: '', techStack: '', description: '', linkUrl: '', longDescription: '' });
    setEditingId(null); setSelectedFile(null); fetchData();
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* 상단 네비게이션 */}
      <nav className="navbar navbar-dark bg-dark sticky-top shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">🚀 ADMIN PORTFOLIO</span>
          <button className={`btn btn-sm ${isAdmin ? 'btn-success' : 'btn-outline-light'}`} onClick={handleAdminToggle}>
            {isAdmin ? "🔓 관리자 모드 ON" : "🔒 보기 모드"}
          </button>
        </div>
      </nav>

      {showLoginModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">관리자 로그인</h5>
                <button className="btn-close" onClick={() => setShowLoginModal(false)}></button>
              </div>
              <form className="modal-body" onSubmit={handleLoginSubmit}>
                <div className="mb-2"><input className="form-control" placeholder="아이디" value={adminUser} onChange={e => setAdminUser(e.target.value)} required /></div>
                <div className="mb-3"><input type="password" className="form-control" placeholder="비밀번호" value={adminPass} onChange={e => setAdminPass(e.target.value)} required /></div>
                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLoginModal(false)}>취소</button>
                  <button type="submit" className="btn btn-primary">로그인</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 히어로 섹션 (프로필 이미지 및 정보) */}
      <header className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <div className="container">
          <div className="row align-items-center">
            {/* 프로필 이미지 영역 */}
            <div className="col-md-3 text-center mb-4 mb-md-0 position-relative">
              <div className="position-relative d-inline-block">
                <img 
                  src={profilePreview || (myInfo.profileImg ? `${API_BASE_URL}${myInfo.profileImg}` : "/placeholder-180.svg")} 
                  alt="Profile" 
                  className="rounded-circle shadow border border-5 border-light" 
                  style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                />
                {isAdmin && (
                  <div className="mt-2">
                    <label htmlFor="profile-file" className="btn btn-xs btn-secondary shadow-sm" style={{fontSize: '0.7rem'}}>
                      📸 사진 변경
                    </label>
                    <input type="file" id="profile-file" className="d-none" onChange={onProfileFileChange} accept="image/*" />
                  </div>
                )}
              </div>
            </div>

            {/* 프로필 정보 영역 */}
            <div className="col-md-9">
              {isAdmin ? (
                <div className="p-4 border rounded-4 bg-light shadow-inner">
                  <h6 className="fw-bold text-primary mb-3">👤 내 프로필 수정</h6>
                  <div className="row g-2">
                    <div className="col-md-6"><input className="form-control" value={myInfo.name} onChange={e => setMyInfo({...myInfo, name: e.target.value})} placeholder="이름" /></div>
                    <div className="col-md-6"><input className="form-control" value={myInfo.role} onChange={e => setMyInfo({...myInfo, role: e.target.value})} placeholder="직무" /></div>
                    <div className="col-12"><textarea className="form-control" rows="2" value={myInfo.intro} onChange={e => setMyInfo({...myInfo, intro: e.target.value})} placeholder="자기소개" /></div>
                    <div className="col-md-4"><input className="form-control" value={myInfo.github} onChange={e => setMyInfo({...myInfo, github: e.target.value})} placeholder="GitHub URL" /></div>
                    <div className="col-md-4"><input className="form-control" value={myInfo.blog} onChange={e => setMyInfo({...myInfo, blog: e.target.value})} placeholder="Blog URL" /></div>
                    <div className="col-md-4"><button className="btn btn-primary w-100 fw-bold" onClick={handleProfileSave}>💾 정보 및 사진 저장</button></div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-md-start">
                  <h1 className="fw-bold text-dark mb-1">{myInfo.name || "이름을 등록하세요"}</h1>
                  <h4 className="text-primary fw-normal mb-3">{myInfo.role || "직무를 등록하세요"}</h4>
                  <p className="text-secondary mb-4" style={{ maxWidth: '700px', lineHeight: '1.8', fontSize: '1.05rem' }}>
                    {myInfo.intro || "자기소개를 입력해 주세요."}
                  </p>
                  <div className="d-flex gap-2 justify-content-center justify-content-md-start">
                    {myInfo.github && <a href={myInfo.github} target="_blank" rel="noreferrer" className="btn btn-dark px-4 rounded-pill shadow-sm">GitHub</a>}
                    {myInfo.blog && <a href={myInfo.blog} target="_blank" rel="noreferrer" className="btn btn-outline-primary px-4 rounded-pill shadow-sm">Blog</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 (프로젝트 리스트) */}
      <main className="container flex-grow-1 pb-5">
        {isAdmin && (
          <div className="card shadow-sm mb-5 border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white fw-bold py-3">📦 새 프로젝트 추가</div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4"><input type="text" className="form-control" placeholder="제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div className="col-md-4"><input type="text" className="form-control" placeholder="기술 스택 (쉼표 구분)" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} /></div>
                <div className="col-md-4"><input type="url" className="form-control" placeholder="링크 (https://...)" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} /></div>
                <div className="col-12"><textarea className="form-control" placeholder="짧은 요약" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                <div className="col-12"><textarea className="form-control" rows="3" placeholder="팝업용 상세 내용" value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} /></div>
                <div className="col-md-6"><input type="file" className="form-control" onChange={e => setSelectedFile(e.target.files[0])} /></div>
                <div className="col-12 pt-2"><button type="submit" className="btn btn-dark px-5 fw-bold rounded-pill">프로젝트 등록</button></div>
              </form>
            </div>
          </div>
        )}

        <div className="d-flex align-items-center mb-4">
          <h3 className="fw-bold m-0 me-3">📂 My Projects</h3>
          <div className="flex-grow-1 border-bottom"></div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects-grid" direction="horizontal">
            {(provided) => (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4" {...provided.droppableProps} ref={provided.innerRef}>
                {projects.map((p, index) => (
                  <Draggable key={p.id} draggableId={String(p.id)} index={index} isDragDisabled={!isAdmin}>
                    {(provided, snapshot) => (
                      <div className="col" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${snapshot.isDragging ? 'shadow-lg border-primary border' : ''}`} style={{ transition: '0.3s' }}>
                          <div style={{ height: '160px', backgroundColor: '#f8f9fa' }}>
                            {p.imageUrl ? <img src={`${API_BASE_URL}${p.imageUrl}`} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" /> : <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No Image</div>}
                          </div>
                          <div className="card-body p-3 d-flex flex-column">
                            <h6 className="card-title fw-bold mb-2 text-truncate">{p.title}</h6>
                            <div className="mb-2 d-flex flex-wrap gap-1">
                              {p.techStack && p.techStack.split(',').map((s, i) => (
                                <span key={i} className="badge rounded-pill bg-light text-primary border border-primary-subtle" style={{fontSize: '0.65rem'}}>#{s.trim()}</span>
                              ))}
                            </div>
                            <p className="card-text text-muted mb-3" style={{ fontSize: '0.85rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                            <div className="d-flex gap-2">
                              <button className="btn btn-outline-dark btn-sm flex-fill fw-bold" onClick={() => setShowDetail(p)}>자세히 보기</button>
                              {p.linkUrl && <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm flex-fill fw-bold">Link</a>}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="card-footer bg-white border-0 d-flex gap-1 pb-3 pt-0 px-3">
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

      {/* 푸터 (연락처 정보) */}
      <footer className="bg-dark text-white py-5">
        <div className="container text-center">
          <h4 className="fw-bold mb-4">Get In Touch</h4>
          <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
            {isAdmin ? (
              <div className="row g-2 w-100" style={{maxWidth: '600px'}}>
                <div className="col-6"><input className="form-control form-control-sm bg-dark text-white border-secondary" value={myInfo.email} onChange={e => setMyInfo({...myInfo, email: e.target.value})} placeholder="이메일" /></div>
                <div className="col-6"><input className="form-control form-control-sm bg-dark text-white border-secondary" value={myInfo.phone} onChange={e => setMyInfo({...myInfo, phone: e.target.value})} placeholder="전화번호" /></div>
              </div>
            ) : (
              <>
                <div className="bg-secondary bg-opacity-25 px-4 py-2 rounded-pill border border-secondary">
                  <small className="text-secondary d-block" style={{fontSize: '0.7rem'}}>EMAIL</small>
                  <span className="fw-bold">{myInfo.email || "이메일 미등록"}</span>
                </div>
                <div className="bg-secondary bg-opacity-25 px-4 py-2 rounded-pill border border-secondary">
                  <small className="text-secondary d-block" style={{fontSize: '0.7rem'}}>PHONE</small>
                  <span className="fw-bold">{myInfo.phone || "전화번호 미등록"}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-secondary small mb-0">© 2026 {myInfo.name || "Portfolio"}. Designed by me.</p>
        </div>
      </footer>

      {/* 상세 보기 팝업 모달 */}
      {showDetail && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-light p-4">
                <h5 className="modal-title fw-bold">{showDetail.title}</h5>
                <button className="btn-close" onClick={() => setShowDetail(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 d-flex flex-wrap gap-1">
                  {showDetail.techStack && showDetail.techStack.split(',').map((s, i) => (
                    <span key={i} className="badge bg-primary px-3 py-2">#{s.trim()}</span>
                  ))}
                </div>
                <div className="bg-light p-4 rounded-4" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem', color: '#333' }}>
                  {showDetail.longDescription || "등록된 상세 설명이 없습니다."}
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button className="btn btn-secondary px-4 rounded-pill" onClick={() => setShowDetail(null)}>닫기</button>
                {showDetail.linkUrl && <a href={showDetail.linkUrl} target="_blank" rel="noreferrer" className="btn btn-primary px-4 rounded-pill">프로젝트 방문</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;