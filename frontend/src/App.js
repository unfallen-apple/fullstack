import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function App() {
  const [projects, setProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', techStack: '', description: '', linkUrl: '', longDescription: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail, setShowDetail] = useState(null); 

  // 프로젝트 목록 가져오기 (순서대로 정렬해서 가져오는 것이 중요)
  const fetchProjects = () => {
    fetch("http://localhost:8080/api/projects")
      .then(res => res.json())
      .then(data => {
        // 서버에서 seq 순으로 정렬해서 주지 않는다면 프론트에서 정렬
        const sortedData = data.sort((a, b) => a.seq - b.seq);
        setProjects(sortedData);
      })
      .catch(err => console.error("로딩 실패:", err));
  };

  useEffect(() => { fetchProjects(); }, []);

  // [핵심] 드래그가 끝났을 때 실행되는 함수
  const onDragEnd = (result) => {
    if (!result.destination) return; // 리스트 밖으로 드롭한 경우

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProjects(items); // 화면 순서 즉시 변경

    // 서버에 바뀐 ID 리스트 전송하여 순서(seq) 업데이트
    const idList = items.map(p => p.id);
    fetch("http://localhost:8080/api/projects/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idList)
    }).then(() => console.log("순서 저장 완료"));
  };

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
      fetch(`http://localhost:8080/api/projects/${id}`, { method: "DELETE" })
      .then(() => fetchProjects());
    }
  };

  const finishSubmit = () => {
    setFormData({ title: '', techStack: '', description: '', linkUrl: '', longDescription: '' });
    setEditingId(null); setSelectedFile(null); fetchProjects();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      title: p.title || '', techStack: p.techStack || '',
      description: p.description || '', linkUrl: p.linkUrl || '',
      longDescription: p.longDescription || ''
    });
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <nav className="navbar navbar-dark bg-dark sticky-top shadow-sm mb-4">
        <div className="container">
          <span className="navbar-brand fw-bold">🚀 MY PORTFOLIO</span>
          <button className={`btn btn-sm ${isAdmin ? 'btn-success' : 'btn-outline-light'}`} onClick={() => setIsAdmin(!isAdmin)}>
            {isAdmin ? "🔓 ADMIN MODE ON" : "🔒 VIEW MODE"}
          </button>
        </div>
      </nav>

      <div className="container">
        {isAdmin && (
          <div className="card shadow-sm mb-5 border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="mb-4 fw-bold text-primary">{editingId ? "🛠️ 프로젝트 수정" : "➕ 새 프로젝트 등록"}</h5>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="기술 스택" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <input type="url" className="form-control" placeholder="링크 (https://...)" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} />
                </div>
                <div className="col-12">
                  <textarea className="form-control" placeholder="짧은 요약" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="col-12">
                  <textarea className="form-control" rows="3" placeholder="상세 내용" value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <input type="file" className="form-control" onChange={e => setSelectedFile(e.target.files[0])} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary px-4 fw-bold">저장하기</button>
                  {editingId && <button type="button" className="btn btn-outline-secondary ms-2" onClick={finishSubmit}>취소</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. 드래그 앤 드롭 영역 */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects-grid" direction="horizontal">
            {(provided) => (
              <div 
                className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {projects.map((p, index) => (
                  <Draggable key={p.id} draggableId={String(p.id)} index={index} isDragDisabled={!isAdmin}>
                    {(provided, snapshot) => (
                      <div 
                        className="col"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps} // 카드 전체를 핸들로 사용
                        style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}
                      >
                        <div className="card h-100 border-0 shadow-sm hover-shadow rounded-4 overflow-hidden position-relative">
                          {/* 관리자일 때 드래그 힌트 아이콘 */}
                          {isAdmin && (
                            <div className="position-absolute top-0 end-0 m-2 badge bg-dark opacity-50">⠿ Drag</div>
                          )}
                          
                          <div style={{ height: '150px', backgroundColor: '#e9ecef' }}>
                            {p.imageUrl ? (
                              <img src={`http://localhost:8080${p.imageUrl}`} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No Image</div>
                            )}
                          </div>

                          <div className="card-body p-3 d-flex flex-column">
                            <h6 className="card-title fw-bold mb-1 text-truncate">{p.title}</h6>
                            <div className="mb-2">
                              <span className="badge rounded-pill bg-light text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                                {p.techStack || 'Stack'}
                              </span>
                            </div>
                            <p className="card-text text-muted mb-3" style={{ fontSize: '0.8rem', flexGrow: 1, height: '40px', overflow: 'hidden' }}>
                              {p.description}
                            </p>
                            
                            <div className="d-flex gap-2">
                              <button className="btn btn-dark btn-sm flex-fill" onClick={() => setShowDetail(p)}>자세히 보기</button>
                              {p.linkUrl && <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm flex-fill">링크</a>}
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="card-footer bg-white border-0 d-flex gap-1 pb-3">
                              <button className="btn btn-light btn-sm flex-fill border" onClick={() => startEdit(p)}>수정</button>
                              <button className="btn btn-light text-danger btn-sm flex-fill border" onClick={() => handleDelete(p.id)}>삭제</button>
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
      </div>

      {/* 4. 상세 보기 모달 */}
      {showDetail && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">{showDetail.title}</h5>
                <button className="btn-close" onClick={() => setShowDetail(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="bg-light p-3 rounded-3" style={{ whiteSpace: 'pre-wrap' }}>
                  {showDetail.longDescription || "상세 설명이 없습니다."}
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary px-4" onClick={() => setShowDetail(null)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;