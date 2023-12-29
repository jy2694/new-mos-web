import { useEffect, useRef, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { SHA256, editArticle, getArticle } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function EditArticle(){

    const fileSelectRef = useRef(null);
    const [session, setSession] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [uploadedAttachs, setUploadedAttachs] = useState([]);
    const [newAttachs, setNewAttachs] = useState([]);
    const [board, setBoard] = useState("");
    const [percent, setPercent] = useState("0%");
    const [status, setStatus] = useState(0);

    const getParameter = (key) => {
        return new URLSearchParams(window.location.search).get(key);
    };

    useEffect(()=>{
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
        setBoard(board);
        getArticle(board, id)
        .then(res => {
            if(res.createBy !== JSON.parse(storage).name + "(" + JSON.parse(storage).studentId + ")"){
                alert("권한이 없습니다.");
                window.location = "/";
                return;
            }
            setTitle(res.title);
            setContent(res.content);
            setUploadedAttachs(res.attachments);
        });
    }, []);

    const renderUploadedAttachs = () => {
        const result = [];
        for (let i = 0; i < uploadedAttachs.length; i++) {
            result.push(<div key={i} className="w-100 text-start align-middle">
                <span className="me-3">{uploadedAttachs[i].realName + uploadedAttachs[i].extension}</span>
                <FontAwesomeIcon icon={faTrashCan} style={{ color: "red" }} onClick={() => {
                    const newAttachs = [];
                    for (let idx = 0; idx < uploadedAttachs.length; idx++) {
                        if (idx !== i) {
                            newAttachs.push(uploadedAttachs[idx]);
                        }
                    }
                    setUploadedAttachs(newAttachs);
                }} />
            </div>);
        }
        return result;
    }

    const renderNewAttachs = () => {
        const result = [];
        for (let i = 0; i < newAttachs.length; i++) {
            result.push(<div key={i} className="w-100 text-start align-middle">
                <span className="me-3">{newAttachs[i].name}</span>
                <FontAwesomeIcon icon={faTrashCan} style={{ color: "red" }} onClick={() => {
                    const newAttach = [];
                    for (let idx = 0; idx < newAttachs.length; idx++) {
                        if (idx !== i) {
                            newAttach.push(newAttachs[idx]);
                        }
                    }
                    setNewAttachs(newAttach);
                }} />
            </div>);
        }
        return result;
    }

    return <>
        <Container className="d-flex justify-content-start mt-3">
            <h4 className="text-start">글 수정</h4>
        </Container>
        <Container className="h-75 border-top border-secondary mt-3 pt-3">
            <Table borderless variant="dark" className="bg-transparent">
                <tbody className="align-middle">
                    <tr>
                        <td >
                            제목 : 
                        </td>
                        <td>
                            <Form.Control type="text" className="text-white bg-dark" value={title} onChange={(e)=>setTitle(e.target.value)}/>
                        </td>
                        <td>
                            게시판 : 
                        </td>
                        <td>
                            <Form.Select className="text-white bg-dark" value={board} disabled>
                                <option value="notice">공지사항</option>
                                <option value="gallery">갤러리</option>
                                <option value="pasttest">족보</option>
                            </Form.Select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            첨부파일 : 
                        </td>
                        <td colSpan={3}>
                            {renderUploadedAttachs()}
                            {renderNewAttachs()}
                            <div className="border rounded" style={{width: "50px"}} onClick={() => fileSelectRef.current.click()}>
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                            <Form.Control ref={fileSelectRef} style={{ display: "none" }} type="file" onChange={(e) => {
                                if (e.target.files.length > 0) {
                                    setNewAttachs([...newAttachs, e.target.files[0]]);
                                }
                            }} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}>
                            <Form.Control as="textarea" rows={15} className="bg-dark text-white" value={content.replaceAll("<br/>", "\n")} onChange={(e) => setContent(e.target.value.replaceAll("\n", "<br/>"))} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4} >
                            <div className="w-100 d-flex justify-content-end">
                                <Button variant="outline-danger" style={{width: "10%"}} className="me-2" onClick={()=>window.location="view?category="+getParameter("category")+"&id="+getParameter("id")}>
                                    취소
                                </Button>
                                <Button variant="outline-success" style={{width: "10%"}} onClick={()=>{
                                    setStatus(1);
                                    editArticle(getParameter("category"), getParameter("id"), {
                                        title: title,
                                        content: content,
                                        uploadedAttachs: uploadedAttachs,
                                        newAttachs: newAttachs
                                    }, (progress) => {
                                        setPercent(Math.round(progress.transferred / progress.total * 100)+"%");
                                    }, () => {
                                        setPercent("업로드 중 문제가 발생했습니다.")
                                    }, () => {
                                        window.location = "/"+getParameter("category")+"?page=1";
                                    })
                                }}>
                                    수정
                                </Button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </Container>
        <Modal show={status === 1}>
            <Modal.Header>
                업로드
            </Modal.Header>
            <Modal.Body className="d-flex justify-content-center align-items-center">
                {percent}
                <div className="w-75" style={{height:"5px", backgroundColor:"gray"}}>
                    <div style={{height: "5px", width: percent.includes("%") ? percent : "", backgroundColor:"green"}}>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </>
}

export default EditArticle;