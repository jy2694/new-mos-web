import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Container, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { SHA256, deleteSeminar, downloadFile, getSeminarData } from "../../firebase";

function SeminarViewer() {
    const [data, setData] = useState();
    const [session, setSession] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
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
            return;
        }
        const id = getParameter("id");
        if (id === null) {
            alert("잘못된 접근입니다.");
            window.location = "/";
            return;
        }
        getSeminarData(id).then(res => setData(res));
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
                        link.click();
                    })
            }}>{data.attachments[i].realName + data.attachments[i].extension}</Dropdown.Item>);
        }
        return result;
    }

    return <>
        <Container className="d-flex justify-content-between align-items-end mt-3">
            <div>
                <h4 className="text-start">{data === undefined ? "" : data.title}</h4>
            </div>
            <div>
                <span className="ms-5">작성일 : {data === undefined ? "" : data.createAt}</span>
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
        <Container className="d-flex justify-content-around w-100 " style={{ height: "50vh" }}>
            <Container className="text-start w-100" dangerouslySetInnerHTML={{ __html: (data === undefined ? "" : data.content) }} />
        </Container>
        <Container className="d-flex justify-content-end w-100 border-top border-secondary pt-2">
            {data !== undefined && session.role >= 1 &&
                <Button
                    className="me-3"
                    variant="outline-warning" onClick={() => window.location = "/seminaredit?id=" + getParameter("id")}>수정</Button>}
            {data !== undefined && session.role >= 1 &&
                <Button
                    variant="outline-danger" onClick={() => setDeleteConfirm(true)}>삭제</Button>}
        </Container>
        <Modal show={deleteConfirm}>
            <Modal.Header>
                게시글 삭제 확인
            </Modal.Header>
            <Modal.Body>
                게시글을 삭제하시겠습니까?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => deleteSeminar(getParameter("id")).then(_ => window.location = "/seminar?page=1")}>
                    삭제
                </Button>
                <Button variant="primary" onClick={() => setDeleteConfirm(false)}>
                    취소
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

export default SeminarViewer;