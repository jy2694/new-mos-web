import { faCircleCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Pagination, Table } from "react-bootstrap";
import { SHA256, downloadFile, getSeminarDataPageCount, getSeminarDatas, getSeminarSearchedDataPageCount, getSeminarSearchedDatas, getSubmitAssign, submitAssignment } from "../../firebase";

function AssignmentListView() {
    const [body, setBody] = useState([]);
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState("");
    const [selected, setSelected] = useState(null);
    const [session, setSession] = useState(null);
    const [submited, setSubmited] = useState(null);
    const [file, setFile] = useState(null);
    const [percent, setPercent] = useState("0%");
    const [status, setStatus] = useState(0);

    const getParameter = (key) => {
        return new URLSearchParams(window.location.search).get(key);
    };

    useEffect(() => {
        if (selected !== null) {
            getSubmitAssign(session, selected)
                .then(res => setSubmited(res));
            setFile(null);
        }
    }, [selected, session]);

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
        if (Number(getParameter("page")) === 0) {
            window.location = "/404";
        }
        setPage(Number(getParameter("page")));
        if (getParameter("search") === null) {
            getSeminarDatas(JSON.parse(storage), Number(getParameter("page")))
                .then(res => {
                    setBody(res);
                });
            getSeminarDataPageCount()
                .then(res =>
                    setMaxPage(Math.ceil(res))
                );
        } else {
            setSearchKeyword(getParameter("search"));
            getSeminarSearchedDatas(JSON.parse(storage), getParameter("search"), Number(getParameter("page")))
                .then(res => setBody(res));
            getSeminarSearchedDataPageCount(getParameter("search"))
                .then(res => setMaxPage(Math.ceil(res)));
        }
    }, []);

    function renderPagination() {
        const result = [];
        if (page < 3) {
            for (let i = 1; i <= (5 > maxPage ? maxPage : 5); i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        } else if (page > maxPage - 3) {
            for (let i = maxPage - 4; i <= maxPage; i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        } else {
            for (let i = page - 2; i <= page + 2; i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        }
        return result;
    }

    function renderBody() {
        const result = [];
        const now = new Date();
        for (let i = 0; i < body.length; i++) {
            if (body[i].assign !== null) {
                const deadline = new Date(body[i].assign.deadline);
                result.push(<tr key={i} onClick={() => {
                    if (deadline < now) {
                        alert("마감된 과제입니다.");
                        return;
                    }
                    setSelected(body[i].assign.id);
                    setSelectedTitle(body[i].title);
                }}>
                    <td>{deadline < now ? "마감" : "진행"}</td>
                    <td>{body[i].title}</td>
                    <td>{body[i].assign.deadline}</td>
                    <td>{body[i].submit !== null && <FontAwesomeIcon icon={faCircleCheck} style={{ color: "lightgreen" }} />}</td>
                </tr>);
            }
        }
        return result;
    }

    return (
        <>
            <Container className="d-flex justify-content-start mt-3">
                <h4 className="text-start">세미나 과제 제출</h4>
            </Container>
            <Container className="h-75 border-top border-secondary mt-3 pt-3">
                <Container className="d-flex justify-content-end mb-4 mt-2">
                    <Form.Control
                        type="search"
                        placeholder="Search"
                        className="me-2 w-25"
                        aria-label="Search"
                        value={searchKeyword === null ? "" : searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <Button variant="outline-light" onClick={() => {
                        if (searchKeyword !== null && searchKeyword !== "") {
                            window.location = "/assignment?search=" + searchKeyword + "&page=1";
                        } else {
                            alert("검색어를 입력해주세요.");
                        }
                    }}>Search</Button>
                </Container>
                <Table striped bordered hover variant="dark" className="w-100">
                    <thead>
                        <tr>
                            <th>상태</th>
                            <th>과제 이름</th>
                            <th>마감일</th>
                            <th>제출</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </Table>
            </Container>
            <Pagination className="h-25 mt-5">
                <Pagination.First onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=1"} />
                <Pagination.Prev onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + (page - 1 < 1 ? 1 : page - 1)} />
                {renderPagination()}
                <Pagination.Next onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + (page + 1 > maxPage ? maxPage : page + 1)} />
                <Pagination.Last onClick={() => window.location = "/assignment?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + maxPage} />
            </Pagination>
            <Modal show={selected !== null}>
                <Modal.Header>
                    <h4>과제 제출</h4><span>과제명 : {selectedTitle}</span>
                </Modal.Header>
                <Modal.Body>
                    <span>1개의 파일을 선택하여 과제로 제출합니다.</span><br />
                    <span>기존에 제출한 파일이 있다면 대체됩니다.</span><br />
                    <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => {
                        if (submited !== null) {
                            downloadFile(submited.fileName)
                                .then(blob => {
                                    let a = document.createElement("a");
                                    a.download = submited.realName + submited.extension;
                                    a.href = window.URL.createObjectURL(blob);
                                    a.click();
                                })
                        }
                    }}>제출된 파일 : {submited === null ? "파일 없음" : submited.realName + submited.extension} <FontAwesomeIcon icon={faDownload} /></span>
                    <Form.Control className="mt-2" type="file" onChange={(e) => {
                        if (e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                        }
                    }} />
                    {status !== 0 && <div className="d-flex justify-content-center align-items-center m-2">
                        {percent}
                        <div className="w-75" style={{ height: "5px", backgroundColor: "gray" }}>
                            <div style={{ height: "5px", width: percent.includes("%") ? percent : "", backgroundColor: "green" }}>
                            </div>
                        </div>
                    </div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={() => setSelected(null)}>취소</Button><Button variant="outline-success" onClick={() => {
                        if (session === null) {
                            alert("권한이 없습니다.");
                            return;
                        }
                        if (selected === null) {
                            alert("선택된 과제가 없습니다.");
                            return;
                        }
                        if (file === null) {
                            alert("업로드할 파일을 선택해주십시오.");
                            return;
                        }
                        if (status === 0) {
                            setStatus(1);
                            submitAssignment(session, selected, file,
                                (progress) => {
                                    setPercent((progress.transferred / progress.total * 100) + "%");
                                }, () => {
                                    setPercent("제출 중 오류가 발생하였습니다.");
                                }, () => {
                                    window.location.reload(true);
                                });
                        } else {
                            alert("업로드 중입니다. 잠시만 기다려주세요.")
                        }
                    }}>제출</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AssignmentListView;