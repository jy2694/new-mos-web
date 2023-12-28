import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { SHA256, getArticlePageCount, getArticles, getSearchedArticlePageCount, getSearchedArticles } from "../../firebase";

export default function GalleryList(props) {

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
            getArticles("gallery", Number(getParameter("page")), true)
                .then(res => setBody(res));
            getArticlePageCount("gallery")
                .then(res =>
                    setMaxPage(Math.ceil(res))
                );
        } else {
            setSearchKeyword(getParameter("search"));
            getSearchedArticles("gallery", getParameter("search"), Number(getParameter("page")), true)
                .then(res => setBody(res));
            getSearchedArticlePageCount("gallery", getParameter("search"))
                .then(res => setMaxPage(Math.ceil(res)));
        }
    }, []);

    useEffect(() => {
        if (page !== 1 && page > maxPage) {
            window.location = "/404";
        }
    }, [maxPage, page]);

    function renderWriteButton() {
        const nowRole = session === null ? -1 : session.role;
        if (props.writeRole <= nowRole) {
            return <Container className="w-100 d-flex justify-content-end align-items-center" onClick={() => window.location = "/write?category=gallery"}>
                <Button>글쓰기</Button>
            </Container>;
        }
        return <></>;
    }

    const renderImageArticles = () => {
        const result = [];
        for (let i = 0; i < body.length; i++) {
            result.push(<div key={i} className="d-flex flex-column justify-content-center align-items-center" style={{ width: "200px", minHeight: "250px", maxHeight: "250px" }} onClick={()=>window.location="/view?category=gallery&id="+body[i].id}>
                    <img className={"bg-white rounded border-white border"}
                        style={{ width: "190px", minHeight: "190px", maxHeight: "190px", objectFit: "cover" }} src={body[i].thumbnail !== null ? body[i].thumbnail : ""} alt="LOAD FAIL"></img>
                    <div>
                        <span className="h6 mt-2 mb-0 d-block">{body[i].title}</span>
                        <span className="d-block p-0" style={{ fontSize: "x-small" }}>{body[i].createAt}</span>
                    </div>
                </div>);
        }
        return result;
    }

    return (
        <>
            <Container className="d-flex justify-content-start mt-3">
                <h4 className="text-start">갤러리</h4>
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
                            window.location = "/gallery?search=" + searchKeyword + "&page=1";
                        } else {
                            alert("검색어를 입력해주세요.");
                        }
                    }}>Search</Button>
                </Container>
                <Container className="d-flex justify-content-start align-content-around flex-wrap">
                    {renderImageArticles()}
                </Container>
                {renderWriteButton()}
            </Container>
        </>
    );
}