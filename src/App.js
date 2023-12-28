import './App.css';
import NavigationBar from './components/NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import ListView from './components/articles/ListView';
import RegisterForm from './components/member/RegisterForm';
import Footer from './components/Footer';
import LoginForm from './components/member/LoginForm';
import Home from './components/Home';
import ApplicantList from './components/member/ApplicantList';
import WriteArticle from './components/articles/WriteArticle';
import UploadSeminarData from './components/seminar/UploadSeminarData';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NotFound from './components/NotFound';
import ArticleViewer from './components/articles/ArticleViewer';
import GalleryList from './components/articles/GalleryList';
import AssignmentListView from './components/seminar/AssignmentListView';
import SeminarListView from './components/seminar/SeminarListView';
import SeminarViewer from './components/seminar/SeminarViewer';
import EditArticle from './components/articles/EditArticle';
import EditSeminarData from './components/seminar/EditSeminarData';
import { SHA256 } from './firebase';

function App() {

  const [session, setSession] = useState(null);

  useEffect(() => {
    const storage = window.sessionStorage.getItem("token");
    const validation = window.sessionStorage.getItem("validation");
    if (storage !== undefined && storage !== null) {
      if(SHA256(storage) !== validation){
        alert("세션 변조가 감지되었습니다. 다시 로그인해주시기 바랍니다.");
        window.sessionStorage.removeItem("token");
        window.sessionStorage.removeItem("validation");
        setSession(null);
        return;
      }
      setSession(JSON.parse(storage));
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <NavigationBar session={session} onLogout={() => setSession(null)} />
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/view" element={<ArticleViewer />}></Route>
            <Route path="/notice" element={<ListView
              title="공지사항"
              writeRole={1}
              headerSize={[ 5, 70, 12.5, 12.5 ]}
              header={[ "#", "제목", "작성자", "작성일" ]}
              category="notice" />}></Route>
            <Route path="/write" element={<WriteArticle />}></Route>
            <Route path="/gallery" element={<GalleryList
              writeRole={1}/>}></Route>
            <Route path="/seminar" element={<SeminarListView
              title="세미나 자료"
              writeRole={1}
              headerSize={[ 5, 82.5, 12.5 ]}
              header={[ "#", "제목", "작성일"]}/>}></Route>
            <Route path="/pasttest" element={<ListView
              title="족보"
              writeRole={0}
              headerSize={[ 5, 70, 12.5, 12.5 ]}
              header={[ "#", "제목", "작성자", "작성일" ]}
              category="pasttest" />}></Route>
            <Route path="/edit" element={<EditArticle />}></Route>
            <Route path="/assignment" element={<AssignmentListView/>}></Route>
            <Route path="/seminarwrite" element={<UploadSeminarData/>}></Route>
            <Route path="/seminarview" element={<SeminarViewer />}></Route>
            <Route path="/seminaredit" element={<EditSeminarData />}></Route>
            <Route path="/login" element={<LoginForm onLogin={(s) => setSession(s)} />}></Route>
            <Route path="/apply" element={<RegisterForm />}></Route>
            <Route path="/applicant" element={session !== null && session.role >= 1 && <ApplicantList />}></Route>
            <Route path="/*" element={<NotFound />}></Route>
          </Routes>
        </header>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
