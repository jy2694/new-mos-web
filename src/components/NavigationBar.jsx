import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";

function NavigationBar(props) {

    function logout() {
        window.sessionStorage.removeItem("token");
        window.sessionStorage.removeItem("validation");
        props.onLogout();
    }

    return <>
        <div>
            <Navbar className="d-flex justify-content-center text-white text-center bg-body-tertiary" bg="dark" data-bs-theme="dark">
                <Navbar.Brand className="d-flex justify-content-center align-items-end" href="/">MOS<span className="ms-1 align-items-end h-100" style={{ fontSize: "0.5em" }}>Make Our Software</span></Navbar.Brand>
            </Navbar>
            <Navbar expand="lg" className="bg-body-tertiary border-bottom border-white border-1" bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">홈</Nav.Link>
                            <NavDropdown title="게시판" id="collapsible-nav-dropdown">
                                <NavDropdown.Item href="/notice?page=1">공지사항</NavDropdown.Item>
                                <NavDropdown.Item href="/gallery?page=1">갤러리</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="스터디" id="collapsible-nav-dropdown2">
                                <NavDropdown.Item href="/seminar?page=1">세미나 자료</NavDropdown.Item>
                                <NavDropdown.Item href="/assignment?page=1">세미나 과제</NavDropdown.Item>
                                {props.session !== null && <>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/pasttest?page=1">족보</NavDropdown.Item>
                                </>}
                            </NavDropdown>
                            { props.session !== null && props.session.role >= 1 && 
                                <NavDropdown title="관리" id="collapsible-nav-dropdown3">
                                <NavDropdown.Item href="/applicant">가입 신청 목록</NavDropdown.Item>
                                <NavDropdown.Item href="/assignment?page=1">과제 제출 관리</NavDropdown.Item>
                            </NavDropdown>
                            }
                        </Nav>
                        {
                            props.session === null && <Nav className="text-white">
                                <Nav.Link href="/login">로그인</Nav.Link>
                                <Nav.Link href="/apply">가입하기</Nav.Link>
                            </Nav>
                        }
                        {
                            props.session !== null && <Nav className="text-white">
                                <Nav.Link href="/" onClick={(e) => logout()}>로그아웃</Nav.Link>
                            </Nav>
                        }
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    </>;
}

export default NavigationBar;