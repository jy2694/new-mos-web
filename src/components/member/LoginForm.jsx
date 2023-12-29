import { useState } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { SHA256, login } from "../../firebase";
import { useNavigate } from "react-router-dom";
import './Login.css';

function LoginForm(props) {

    const navigation = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    function loginProc() {
        if(id === "" || pw === ""){
            alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            return;
        }
        login(id, pw)
        .then(res => {
            if(res !== null){
                window.sessionStorage.setItem("token", JSON.stringify(res));
                window.sessionStorage.setItem("validation", SHA256(JSON.stringify(res)));
                props.onLogin(res);
                navigation("/");
            } else {
                alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        });
    }

    return <>
        <Container className="d-flex flex-column w-75 justify-content-center mt-5">
            <h3 className="w-100 text-start mb-3">로그인</h3>
            <Container className="d-flex flex-column w-100 justify-content-center border-top border-secondary ">
                <Container className="w-100 d-flex justify-content-center mt-5">
                    <Table className="table-borderless mt-3 res-width text-start">
                        <tbody>
                            <tr>
                                {/* <td className="align-middle bg-transparent text-white">
                                    아이디 :
                                </td> */}
                                <td className="align-middle bg-transparent">
                                    <Form.Control type="text" placeholder="아이디" className="inputtext bg-transparent text-white" value={id} onChange={(e) => setId(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                {/* <td className="align-middle bg-transparent text-white">
                                    비밀번호 :
                                </td> */}
                                <td className="align-middle bg-transparent">
                                    <Form.Control  type="password" placeholder="비밀번호" className="inputtext bg-transparent text-white" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e)=>{
                                        if(e.code === "Enter"){
                                            loginProc();
                                        }
                                    }}/>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="align-middle bg-transparent">
                                    <Button className="w-100" onClick={loginProc}>로그인</Button>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Container>
            </Container>
        </Container>
    </>
}

export default LoginForm;