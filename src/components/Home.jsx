import '../css/Home.css';
import make from '../images/make.jpg'
function Home(){
    return <>
        <div className="d-flex w-100 justify-content-center">
            <div className="d-flex flex-column justify-content-center align-items-center" style={{width: "100%", height: "65vh"}}>
                <img src={make} className="w-100 h-100 fadeIn-1" style={{objectFit:"cover"}} alt="background"/>
                <div style={{position:"absolute", top:"50%", left:"0px"}} className="w-100 d-flex flex-column justify-content-center align-items-center text-black">
                    <span className="h1 fadeIn-text" style={{textShadow: "6px 2px 4px gray"}}>M.O.S</span>
                    <span className="h4 fadeIn-text" style={{textShadow: "6px 2px 4px gray"}}>Make Our Software</span>
                    <span className="h6 fadeIn-text" style={{textShadow: "6px 2px 4px gray"}}>42년 전통 컴퓨터소프트웨어공학과 학술 동아리입니다.</span>
                </div>
            </div>
        </div>
    </>
}
export default Home;