import { useEffect, useState } from "react";
import { Button, Container, Form, Pagination, Table } from "react-bootstrap";
import { SHA256, getArticlePageCount, getArticles, getSearchedArticlePageCount, getSearchedArticles } from "../../firebase";

function ListView(props) {

    const [body, setBody] = useState([]);
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState(null);
    const [session, setSession] = useState(null);

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
        }
    }, []);
    const getParameter = (key) => {
        return new URLSearchParams(window.location.search).get(key);
    };
    useEffect(() => {
        if (Number(getParameter("page")) === 0) {
            window.location = "/404";
        }
        setPage(Number(getParameter("page")));
        if (getParameter("search") === null) {
            getArticles(props.category, Number(getParameter("page")))
                .then(res => setBody(res));
            getArticlePageCount(props.category)
                .then(res =>
                    setMaxPage(Math.ceil(res))
                );
        } else {
            setSearchKeyword(getParameter("search"));
            getSearchedArticles(props.category, getParameter("search"), Number(getParameter("page")))
                .then(res => setBody(res));
            getSearchedArticlePageCount(props.category, getParameter("search"))
                .then(res => setMaxPage(Math.ceil(res)));
        }
    }, [props.category]);

    useEffect(() => {
        if (page !== 1 && page > maxPage) {
            window.location = "/404";
        }
    }, [maxPage, page]);

    function renderWriteButton() {
        const nowRole = session === null ? -1 : session.role;
        if (props.writeRole <= nowRole) {
            return <Container className="w-100 d-flex justify-content-end align-items-center" onClick={() => window.location = "/write?category=" + props.category}>
                <Button>글쓰기</Button>
            </Container>;
        }
        return <></>;
    }

    function renderHeader() {
        const result = [];
        for (let i = 0; i < props.headerSize.length; i++) {
            result.push(<th key={i} style={{ width: props.headerSize[i] + "%" }}>{props.header[i]}</th>);
        }
        return result;
    }

    function renderBody() {

        const result = [];
        for (let i = 0; i < body.length; i++) {
            result.push(<tr key={i + 4 + ((page - 1) * 10)} onClick={() => window.location = "/view?category=" + props.category + "&id=" + body[i].id}>
                <td>{i + ((page - 1) * 10)}</td>
                <td>{body[i].title}</td>
                <td>{body[i].createBy}</td>
                <td>{body[i].createAt}</td>
            </tr>)
        }
        return result;
    }

    function renderPagination() {
        const result = [];
        if (page < 3) {
            for (let i = 1; i <= (5 > maxPage ? maxPage : 5); i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        } else if (page > maxPage - 3) {
            for (let i = maxPage - 4; i <= maxPage; i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        } else {
            for (let i = page - 2; i <= page + 2; i++) {
                result.push(<Pagination.Item active={page === i ? true : false} key={i}
                    onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + i}>
                    {i}</Pagination.Item>);
            }
        }
        return result;
    }

    return <>
        <Container className="d-flex justify-content-start mt-3">
            <h4 className="text-start">{props.title}</h4>
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
                        window.location = "/" + props.category + "?search=" + searchKeyword + "&page=1";
                    } else {
                        alert("검색어를 입력해주세요.");
                    }
                }}>Search</Button>
            </Container>
            <Table striped bordered hover variant="dark" className="w-100">
                <thead>
                    <tr>
                        {renderHeader()}
                    </tr>
                </thead>
                <tbody>
                    {renderBody()}
                </tbody>
            </Table>
            {renderWriteButton()}
        </Container>
        <Pagination className="h-25 mt-5">
            <Pagination.First onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=1"} />
            <Pagination.Prev onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + (page - 1 < 1 ? 1 : page - 1)} />
            {renderPagination()}
            <Pagination.Next onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + (page + 1 > maxPage ? maxPage : page + 1)} />
            <Pagination.Last onClick={() => window.location = "/" + props.category + "?" + (getParameter("search") === null ? "" : "search=" + getParameter("search") + "&") + "page=" + maxPage} />
        </Pagination>
    </>;
}

export default ListView;