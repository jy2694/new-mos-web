import { useEffect, useState } from "react";
import { SHA256, downloadFile, getSeminarDataPageCount, getSeminarDatas, getSeminarSearchedDataPageCount, getSeminarSearchedDatas, getSubmits } from "../../firebase";
import { Button, Container, Form, Modal, Pagination, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faDownload } from "@fortawesome/free-solid-svg-icons";

export default function AssignmentSubmitManagement() {

    const [session, setSession] = useState(null);
    const [body, setBody] = useState([]);
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState(null);
    const [selected, setSelected] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState("");
    const [submits, setSubmits] = useState([]);

    const getParameter = (key) => {
        return new URLSearchParams(window.location.search).get(key);
    };

    const dateFormmater = (d) => {
        if (d === undefined || d === null) return "";
        const date = d.toDate();
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) month = "0" + month.toString();
        let da = date.getDate();
        if (da < 10) da = "0" + da.toString();
        let hour = date.getHours();
        if (hour < 10) hour = "0" + hour.toString();
        let minute = date.getMinutes();
        if (minute < 10) minute = "0" + minute.toString();
        let second = date.getSeconds();
        if (second < 10) second = "0" + second.toString();
        return year + "-" + month + "-" + da + " " + hour + ":" + minute + ":" + second;
    }

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
            if (JSON.parse(storage).role < 1) {
                alert("권한이 없습니다.");
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
            getSeminarDataPageCount(true)
                .then(res =>
                    setMaxPage(Math.ceil(res))
                );
        } else {
            setSearchKeyword(getParameter("search"));
            getSeminarSearchedDatas(JSON.parse(storage), getParameter("search"), Number(getParameter("page")))
                .then(res => setBody(res));
            getSeminarSearchedDataPageCount(getParameter("search"), true)
                .then(res => {
                    setMaxPage(Math.ceil(res));
                });
        }
    }, []);

    useEffect(() => {
        if (selected !== null) {
            getSubmits(selected)
                .then(res => {
                    setSubmits(res);
                });
        }
    }, [selected]);

    function renderSubmit() {
        const result = [];
        for (let i = 0; i < submits.length; i++) {
            result.push(<tr key={i}>
                <td>
                    {submits[i].member}
                </td>
                <td>
                    {dateFormmater(submits[i].timestamp)}
                </td>
                <td>
                    <Button size="sm" variant="outline-dark"
                        onClick={() => {
                            downloadFile(submits[i].attachments)
                                .then(d => {
                                    let link = document.createElement("a");
                                    link.download = submits[i].file;
                                    link.href = window.URL.createObjectURL(d);
                                    link.click();
                                })
                        }}
                    >다운로드<FontAwesomeIcon className="ms-1" icon={faDownload} /></Button>
                </td>
            </tr>);
        }
        return result;
    }

    function renderPagination() {
        const result = [];
        if (page < 3) {
            for (let i = 1; i <= (5 > maxPage ? maxPage : 5); i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/assmanage?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        } else if (page > maxPage - 3) {
            for (let i = maxPage - 4; i <= maxPage; i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/assmanage?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        } else {
            for (let i = page - 2; i <= page + 2; i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/assmanage?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
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
                    setSelected(body[i].id);
                    setSelectedTitle(body[i].title);
                }}>
                    <td><FontAwesomeIcon className={(deadline < now ? "text-danger " : "text-success ") + "me-1"} icon={faCircle}></FontAwesomeIcon>{deadline < now ? "마감" : "진행"}</td>
                    <td>{body[i].title}</td>
                    <td>{body[i].assign.deadline}</td>
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
                            window.location = "/assmanage?search=" + searchKeyword.replaceAll("#", "%23") + "&page=1";
                        } else {
                            alert("검색어를 입력해주세요.");
                        }
                    }}>Search</Button>
                </Container>
                <Table striped bordered hover variant="dark" className="w-100">
                    <thead>
                        <tr>
                            <th>
                                상태
                            </th>
                            <th>
                                과제 이름
                            </th>
                            <th>
                                마감 기한
                            </th>
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
            <Modal show={selected !== null} onHide={() => setSelected(null)} size="lg">
                <Modal.Header closeButton >
                    <h3 className="me-3">제출자 조회</h3><span>과제명 : {selectedTitle}</span>
                </Modal.Header>
                <Modal.Body>
                    <Table>
                        <thead>
                            <tr>
                                <th>
                                    제출자
                                </th>
                                <th>
                                    제출시각
                                </th>
                                <th>
                                    파일
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderSubmit()}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </>
    );
}