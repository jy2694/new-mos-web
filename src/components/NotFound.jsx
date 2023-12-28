import { Container } from 'react-bootstrap';
import image from '../images/notfound.png';
export default function NotFound(){
    return (<Container className="m-5">
        <img src={image} className="w-25 h-25 mb-5" alt="Not Found"></img>
        <h2>페이지를 찾을 수 없습니다.</h2>
    </Container>);
}