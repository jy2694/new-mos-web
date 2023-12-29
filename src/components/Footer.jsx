import { Container } from "react-bootstrap";

function Footer(){
    return <>
        <div className="w-100 border-top border-secondary p-4 d-flex justify-content-around" style={{backgroundColor:"#282c34", fontSize:"0.8em"}}>
            <Container className="d-flex flex-column text-start text-secondary">
                <span>Copyright 2023. MOS. all rights reserved.</span>
                <span>Contact : {process.env.REACT_APP_CONTACT_US}</span>
            </Container>
            <Container className="d-flex flex-column text-end text-secondary">
                <span>회장 : {process.env.REACT_APP_OFFICER_NAME}</span>
                <span>{process.env.REACT_APP_OFFICER_PHONE}</span>
            </Container>
        </div>
    </>
}

export default Footer;