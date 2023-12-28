import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Container, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { SHA256, deleteArticle, downloadFile, getArticle, getArticleImages } from "../../firebase";

function ArticleViewer() {
    const [data, setData] = useState();
    const [session, setSession] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [images, setImages] = useState([]);
    const getParameter = (key) => {
        return new URLSearchParams(window.location.search).get(key);
    };
    useEffect(() => {
        const storage = window.sessionStorage.getItem("token");
        const validation = window.sessionStorage.getItem("validation");
        if (storage !== undefined && storage !== null) {
            if (SHA256(storage) !== validation) {
                alert("세션 변조가 감지되었습니다. 다시 로그인해주시기 바랍니다.");
                window.sessionStorage.removeItem("token");
                window.sessionStorage.removeItem("validation");
                setSession(null);
                window.location = "/";
                return;
            }
            setSession(JSON.parse(storage));
        } else {
            alert("권한이 없습니다.");
            window.location = "/";
            return;
        }
        const board = getParameter("category");
        const id = getParameter("id");
        if (board === null || id === null) {
            alert("잘못된 접근입니다.");
            window.location = "/";
            return;
        }
        getArticle(board, id).then(res => setData(res));
        getArticleImages(id).then(res => setImages(res));
    }, []);

    function renderAttachments() {
        if (data === undefined) return [];
        const result = [];
        for (let i = 0; i < data.attachments.length; i++) {
            result.push(<Dropdown.Item key={i} onClick={() => {
                downloadFile(data.attachments[i].fileName)
                    .then(d => {
                        let link = document.createElement("a");
                        link.download = data.attachments[i].realName + data.attachments[i].extension;
                        link.href = window.URL.createObjectURL(d);
                        document.body.appendChild(link);
                        link.click();
                    })
            }}>{data.attachments[i].realName + data.attachments[i].extension}</Dropdown.Item>);
        }
        return result;
    }

    function renderImages(){
        if (data === undefined) return [];
        const result = [];
        for(let i = 0; i < images.length; i ++){
            result.push(<img key={i+data.attachments.length} src={images[i]} alt="LOAD FAIL" className="w-50 m-1" style={{objectFit: "cover"}}></img>);
        }
        return result;
    }

    return <>
        <Container className="d-flex justify-content-between align-items-end mt-3">
            <div>
                <h4 className="text-start">{data === undefined ? "" : data.title}</h4>
            </div>
            <div>
                <span className="ms-5">작성자 : {data === undefined ? "" : data.createBy} | 작성일 : {data === undefined ? "" : data.createAt}</span>
            </div>
        </Container>
        <Container className="d-flex justify-content-end w-100 border-top border-secondary mt-3 pt-3 w-100">
            {data !== undefined && data.attachments.length !== 0 && <DropdownButton
                drop="start"
                variant="outline-light"
                size="sm"
                title={<><FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: "5px" }} /><span>첨부파일</span></>}>
                {renderAttachments()}
            </DropdownButton>}
        </Container>
        <Container className="d-flex flex-column justify-content-start align-items-center w-100" style={{minHeight: "50vh"}}>
            <Container className="text-start w-100" dangerouslySetInnerHTML={{ __html: (data === undefined ? "" : data.content) }} />
            {renderImages()}
        </Container>
        
        <Container className="d-flex justify-content-end w-100 border-top border-secondary pt-2">
            {data !== undefined && session !== null && data.createBy === (session.name + "(" + session.studentId + ")") &&
                <Button 
                className="me-3" 
                variant="outline-warning" onClick={()=>window.location="edit?category="+getParameter("category")+"&id="+getParameter("id")}>수정</Button>}
            {data !== undefined && session !== null && (data.createBy === (session.name + "(" + session.studentId + ")") || session.role >= 1) &&
                <Button 
                variant="outline-danger" onClick={()=>setDeleteConfirm(true)}>삭제</Button>}
        </Container>
        <Modal show={deleteConfirm}>
            <Modal.Header>
                게시글 삭제 확인
            </Modal.Header>
            <Modal.Body>
                게시글을 삭제하시겠습니까?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={()=>deleteArticle(getParameter("category"), getParameter("id")).then(_=>window.location="/"+getParameter("category")+"?page=1")}>
                    삭제
                </Button>
                <Button variant="primary" onClick={()=>setDeleteConfirm(false)}>
                    취소
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

export default ArticleViewer;