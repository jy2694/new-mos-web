import { faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { SHA256, createSeminarData } from "../../firebase";

function UploadSeminarData() {
    const [session, setSession] = useState(null);
    const fileSelectRef = useRef(null);
    const [title, setTitle] = useState("");
    const [assignment, setAssignment] = useState(false);
    const [content, setContent] = useState("");
    const [attachs, setAttachs] = useState([]);
    const [date, setDate] = useState("2000-01-01");
    const [status, setStatus] = useState(0);
    const [percent, setPercent] = useState("0%");

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
        }
    }, []);

    const renderAttachs = () => {
        const result = [];
        for (let i = 0; i < attachs.length; i++) {
            result.push(<div key={i} className="w-100 text-start align-middle">
                <span className="me-3">{attachs[i].name}</span>
                <FontAwesomeIcon icon={faTrashCan} style={{ color: "red" }} onClick={() => {
                    const newAttachs = [];
                    for (let idx = 0; idx < attachs.length; idx++) {
                        if (idx !== i) {
                            newAttachs.push(attachs[idx]);
                        }
                    }
                    setAttachs(newAttachs);
                }} />
            </div>);
        }
        return result;
    }

    const uploadData = () => {
        if (session === null) {
            alert("권한이 없습니다.");
            window.location = "/";
            return;
        }
        if (title === "") {
            alert("게시글 제목이 비어있습니다.");
            return;
        }
        if (content === "") {
            alert("게시글 내용이 비어있습니다.");
            return;
        }
        const data = {
            title: title,
            content: content,
            deadline: date,
            assign_exist: assignment
        };
        setStatus(1);
        createSeminarData(data, attachs, (percent) => {
            setPercent(Math.round(percent.transferred / percent.total * 100) + "%");
        }, () => {
            setPercent("업로드 중 문제가 발생했습니다.")
        }, () => {
            window.location = "/seminar?page=1";
        })
    }

    return <>
        <Container className="d-flex justify-content-start mt-3">
            <h4 className="text-start">세미나 자료 작성</h4>
        </Container>
        <Container className="h-75 border-top border-secondary mt-3 pt-3">
            <Table borderless variant="dark">
                <tbody className="align-middle">
                    <tr>
                        <td>
                            제목 :
                        </td>
                        <td>
                            <Form.Control type="text" className="text-white bg-dark" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </td>
                        <td colSpan={2}>
                            <div className="d-flex justify-content-center">
                                <Form.Check label="과제 게시" checked={assignment} onChange={(e) => setAssignment(e.target.checked)} />
                            </div>
                        </td>
                    </tr>
                    {assignment &&
                        <tr>
                            <td>
                                과제 마감 기한 :
                            </td>
                            <td>
                                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </td>
                            <td />
                            <td />
                        </tr>
                    }
                    <tr>
                        <td>
                            첨부파일 :
                        </td>
                        <td colSpan={3}>
                            {renderAttachs()}
                            <div className="border rounded" style={{ width: "50px" }} onClick={() => fileSelectRef.current.click()}>
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                            <Form.Control ref={fileSelectRef} style={{ display: "none" }} type="file" onChange={(e) => {
                                if (e.target.files.length > 0) {
                                    setAttachs([...attachs, e.target.files[0]]);
                                }
                            }} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}>
                            <Form.Control as="textarea" rows={15} className="bg-dark text-white" value={content} onChange={(e) => setContent(e.target.value)} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4} >
                            <div className="w-100 d-flex justify-content-end">
                                <Button variant="outline-success" style={{ width: "10%" }} onClick={uploadData}>
                                    작성
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
                <div className="w-75" style={{ height: "5px", backgroundColor: "gray" }}>
                    <div style={{ height: "5px", width: percent.includes("%") ? percent : "", backgroundColor: "green" }}>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </>
}

export default UploadSeminarData;