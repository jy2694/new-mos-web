import { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { SHA256, acceptApply, getApplicantList, rejectApply } from "../../firebase";

function ApplicantList() {
    const [selected, setSelected] = useState(-1);
    const [applicants, setApplicants] = useState([]);
    const [deleteFlag, setDeleteFlag] = useState(false);

    useEffect(()=>{
        const storage = window.sessionStorage.getItem("token");
        const validation = window.sessionStorage.getItem("validation");
        if (storage !== undefined && storage !== null) {
            if (SHA256(storage) !== validation) {
                alert("세션 변조가 감지되었습니다. 다시 로그인해주시기 바랍니다.");
                window.sessionStorage.removeItem("token");
                window.sessionStorage.removeItem("validation");
                window.location = "/";
                return;
            }
            if (JSON.parse(storage).role < 1) {
                alert("권한이 없습니다.");
                window.location = "/";
                return;
            }
        } else {
            alert("권한이 없습니다.");
            window.location = "/";
            return;
        }
    }, []);

    useEffect(() => {
        if (applicants.length !== 0) return;
        if(deleteFlag){
            setDeleteFlag(false);
            return;
        } 
        getApplicantList()
            .then(res => setApplicants(res));
    }, [applicants, deleteFlag]);

    function deleteApplicant(idx){
        const newapplicants = [];
        for(let i = 0; i < applicants.length; i ++){
            if(i === idx) continue;
            newapplicants.push(applicants[i]);
        }
        setDeleteFlag(true);
        setApplicants(newapplicants);
    }

    function renderApplicants() {
        const result = [];
        for (let i = 0; i < applicants.length; i++) {
            result.push(<tr key={i}>
                <td onClick={(_) => setSelected(i)}>
                    {applicants[i].name}
                </td>
                <td onClick={(_) => setSelected(i)}>
                    {applicants[i].studentId}
                </td>
                <td onClick={(_) => setSelected(i)}>
                    {applicants[i].univ}
                </td>
                <td onClick={(_) => setSelected(i)}>
                    {applicants[i].dept}
                </td>
                <th>
                    <Button className="me-3" variant="primary" onClick={(_)=>{
                        acceptApply(applicants[i].id)
                        .then(() => {
                            alert("가입이 승인되었습니다.");
                            deleteApplicant(i);
                        })
                    }}>
                        승인
                    </Button>
                    <Button variant="danger" onClick={(_)=>{
                        rejectApply(applicants[i].id)
                        .then(() => {
                            alert("가입이 거절되었습니다.");
                            deleteApplicant(i);
                        })
                    }}>
                        거절
                    </Button>
                </th>
            </tr>);
        }
        return result;
    }

    return <>
        <Container className="d-flex justify-content-start mt-3">
            <h4 className="text-start">지원자 목록</h4>
        </Container>
        <Container className="h-75 border-top border-secondary mt-3 pt-3">
            <Table striped bordered hover variant="dark" className="w-100">
                <thead>
                    <tr>
                        <th>
                            이름
                        </th>
                        <th>
                            학번
                        </th>
                        <th>
                            대학
                        </th>
                        <th>
                            학과
                        </th>
                        <th>
                            처리
                        </th>
                    </tr>
                </thead>
                <tbody className="align-middle">
                    {renderApplicants()}
                </tbody>
            </Table>
        </Container>
        <Modal
            style={{ fontFamily: "Elice DX Neolli" }}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={selected !== -1} onHide={() => setSelected(-1)}>
            <Modal.Header className="bg-dark text-white" closeButton >
                <Modal.Title>동아리 지원 신청서<span className="h6">__{selected < 0 ? "" : applicants[selected].name}</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white">
                <Table>
                    <tbody>
                        <tr>
                            <td className="bg-transparent text-white border-1 border-white">
                                아이디 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                {selected < 0 ? "" : applicants[selected].id}
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                비밀번호 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                *******************
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-transparent text-white border-1 border-white">
                                이름 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                {selected < 0 ? "" : applicants[selected].name}
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                학번 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                {selected < 0 ? "" : applicants[selected].studentId}
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-transparent text-white border-1 border-white">
                                대학 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                {selected < 0 ? "" : applicants[selected].univ}
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                학과 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                {selected < 0 ? "" : applicants[selected].dept}
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-transparent text-white border-1 border-white">
                                학년 :
                            </td>
                            <td className="bg-transparent text-white border-1 border-white">
                                {selected < 0 ? "" : applicants[selected].grade} 학년
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <Container className="mt-2 w-100">
                    <span>지원 동기 : </span>
                    <Form.Control as="textarea" className="mt-3 bg-transparent text-white mb-3 w-100" disabled rows={3} value={selected < 0 ? "" : applicants[selected].reason} />
                </Container>
                <Container className="mt-2 w-100">
                    <span>사용 가능한 프로그래밍 언어 : </span>
                    <Form.Control as="textarea" className="mt-3 bg-transparent text-white mb-3 w-100" disabled rows={3} value={selected < 0 ? "" : applicants[selected].lang} />
                </Container>
                <Container className="mt-2 w-100">
                    <span>배우고 싶은 분야 : </span>
                    <Form.Control as="textarea" className="mt-3 bg-transparent text-white mb-3 w-100" disabled rows={3} value={selected < 0 ? "" : applicants[selected].want} />
                </Container>
            </Modal.Body>
        </Modal>
    </>
}

export default ApplicantList;