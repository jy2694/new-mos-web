import { useState } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { memberApply } from "../../firebase";
import { useNavigate } from "react-router-dom";

function RegisterForm() {

    function leftPad(value) {
        if (value >= 10) {
            return value;
        }
    
        return `0${value}`;
    }
    
    function toStringByFormatting(source, delimiter = '-') {
        const year = source.getFullYear();
        const month = leftPad(source.getMonth() + 1);
        const day = leftPad(source.getDate());
    
        return [year, month, day].join(delimiter);
    }

    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [univ, setUniv] = useState("창의공과대학");
    const [dept, setDept] = useState("컴퓨터소프트웨어공학과");
    const [grade, setGrade] = useState("1");
    const [birth, setBirth] = useState(toStringByFormatting(new Date()));
    const [phone, setPhone] = useState("");
    const [reason, setReason] = useState("");
    const [lang, setLang] = useState("");
    const [want, setWant] = useState("");

    function apply(e){
        if(id === ""){
            alert("아이디가 입력되지 않았습니다.");
            return;
        }
        if(pw === ""){
            alert("비밀번호가 입력되지 않았습니다.");
            return;
        }
        if(name === ""){
            alert("이름이 입력되지 않았습니다.");
            return;
        }
        if(studentId === ""){
            alert("학번이 입력되지 않았습니다.");
            return;
        }
        if(studentId.length !== 8){
            alert("학번이 형식에 맞지 않습니다. 8자리로 입력해주세요.");
            return;
        }
        if(univ === ""){
            alert("대학이 입력되지 않았습니다.");
            return;
        }
        if(univ === ""){
            alert("학과가 입력되지 않았습니다.");
            return;
        }
        if(phone === ""){
            alert("전화번호가 입력되지 않았습니다.");
            return;
        }
        if(/\d{11}/.test(phone)){
            alert("전화번호가 형식에 맞지 않습니다. 숫자로만 11자리로 작성해주십시오.");
            return;
        }
        const applydata = {
            id: id,
            pw: pw,
            name: name,
            studentId: studentId,
            univ: univ,
            dept: dept,
            grade: grade,
            birth: birth,
            phone: phone,
            reason: reason,
            lang: lang,
            want: want,
            role: 0
        }
        memberApply(applydata)
        .then(code => {
            if(code === 0){
                alert("동아리 지원서가 접수되었습니다.");
                navigate("/");
            } else if(code === 1) {
                alert("이미 사용 중인 아이디거나 접수 완료된 아이디입니다.");
            } else if(code === 2){
                alert("이미 가입된 정보이거나 접수 완료된 정보입니다.");
            }
        })
    }

    return <>
        <Container className="d-flex flex-column w-75 justify-content-start mt-5">
            <h3 className="w-100 text-start mb-3">동아리 가입 신청서</h3>
            <Container className="d-flex flex-column w-100 justify-content-start border-top border-secondary">
                <Container className="h6 text-start mt-3">
                    <span className="text-warning">*</span><span> 표시가 있는 항목은 필수 입력 항목입니다.</span>
                </Container>
                <Table className="table-borderless mt-3 text-start">
                    <tbody>
                    <tr>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 아이디 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="text" className="bg-transparent text-white" value={id} onChange={(e)=>setId(e.target.value)}/>
                            </td>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 비밀번호 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="password" className="bg-transparent text-white"value={pw} onChange={(e)=>setPw(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 이름 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="text" className="bg-transparent text-white" value={name} onChange={(e)=>setName(e.target.value)}/>
                            </td>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 학번 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="text" className="bg-transparent text-white" value={studentId} onChange={(e)=>setStudentId(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 대학 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="text" className="bg-transparent text-white" value={univ} onChange={(e)=>setUniv(e.target.value)}/>
                            </td>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 학과 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="text" className="bg-transparent text-white" value={dept} onChange={(e)=>setDept(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 학년 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Select className="bg-transparent text-white" value={grade} onChange={(e)=>setGrade(e.target.value)}>
                                    <option value="1">1학년</option>
                                    <option value="2">2학년</option>
                                    <option value="3">3학년</option>
                                    <option value="4">4학년</option>
                                </Form.Select>
                            </td>
                            <td className="align-middle bg-transparent text-white">
                            </td>
                            <td className="align-middle bg-transparent">
                            </td>
                        </tr>
                        <tr>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 생년월일 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="date" className="bg-transparent text-white" value={birth} onChange={(e)=>setBirth(e.target.value)}/>
                            </td>
                            <td className="align-middle bg-transparent text-white">
                                <span className="text-warning">*</span> 전화번호 :
                            </td>
                            <td className="align-middle bg-transparent">
                                <Form.Control type="text" className="bg-transparent text-white" value={phone} onChange={(e)=>setPhone(e.target.value)}/>
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <Container className="text-start">
                    <span className="text-warning">*</span><span> 지원 동기 : </span>
                    <Form.Control as="textarea" className="mt-3 bg-transparent text-white" rows={5} value={reason} onChange={(e)=>setReason(e.target.value)}/>
                </Container>
                <Container className="text-start mt-3">
                    <span className="text-warning">*</span><span> 사용 가능한 프로그래밍 언어 : </span>
                    <Form.Control as="textarea" className="mt-3 bg-transparent text-white" rows={5} value={lang} onChange={(e)=>setLang(e.target.value)}/>
                </Container>
                <Container className="text-start mt-3">
                    <span className="text-warning">*</span><span> 배우고자 하는 분야 : </span>
                    <Form.Control as="textarea" className="mt-3 bg-transparent text-white mb-3" rows={5} value={want} onChange={(e)=>setWant(e.target.value)}/>
                </Container>
                <Container className="d-flex justify-content-end mb-5">
                    <Button onClick={apply}>지원하기!</Button>
                </Container>
            </Container>
        </Container>
    </>
}

export default RegisterForm;