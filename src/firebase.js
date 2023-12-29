import { initializeApp } from "firebase/app";
import { getFirestore, getDoc, setDoc, doc, getDocs, collection, query, where, deleteDoc } from 'firebase/firestore/lite';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FB_API_ID,
    authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FB_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FB_API_ID,
    measurementId: process.env.REACT_APP_FB_MEASUREMENT_ID
};

const cryptojs = require('crypto-js');
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage();

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0;
        let s = r & 0x3;
        let m = s | 0x8;
        let v = c === 'x' ? r : m;
        return v.toString(16);
    });
}
export function SHA256(text){
    return cryptojs.SHA256(text).toString();
}
//Member Management
export async function memberApply(applydata) {
    if (await isExistID(applydata.id)) return 1;
    if (await isExistApply(applydata)) return 2;
    applydata.pw = SHA256(applydata.pw);
    const applyRef = doc(db, 'applicant', createUUID());
    await setDoc(applyRef, applydata, { merge: false });
    return 0;
}
export async function isExistID(userid) {
    const querySnapshot = await getDocs(collection(db, "applicant"));
    let result = false;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id === userid) {
            result = true;
        }
    });
    const memberSnapshot = await getDocs(collection(db, "member"));
    memberSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id === userid) {
            result = true;
        }
    });
    return result;
}
export async function isExistApply(applydata) {
    if (applydata === undefined) return null;
    let result = false;
    const querySnapshot = await getDocs(collection(db, "applicant"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentId === applydata.studentId) {
            result = true;
        }
    });
    const memberSnapshot = await getDocs(collection(db, "member"));
    memberSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentId === applydata.studentId) {
            result = true;
        }
    });
    return result;
}
export async function getApplicantList() {
    let applicants = [];
    const querySnapshot = await getDocs(collection(db, "applicant"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        applicants.push(data);
    });
    return applicants;
}
export async function acceptApply(userid) {
    const q = query(collection(db, "applicant"), where("id", "==", userid));
    let data = null;
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        data = doc;
    });
    const memberRef = doc(db, 'member', createUUID());
    await setDoc(memberRef, data.data(), { merge: false });
    deleteDoc(doc(db, 'applicant', data.id));
}
export async function rejectApply(userid) {
    const q = query(collection(db, "applicant"), where("id", "==", userid));
    let data = null;
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        data = doc;
    });
    deleteDoc(doc(db, 'applicant', data.id));
}
export async function login(userid, userpw) {
    const q = query(collection(db, "member"), where("id", "==", userid));
    let data = null;
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        data = doc;
    });
    if (data === null) {
        return null;
    }
    if (data.data().pw !== cryptojs.SHA256(userpw).toString()) {
        return null;
    }
    return data.data();
}

export async function createAttachmentData(fileName, realName, extension, article) {
    const attachRef = doc(db, "attachments", fileName);
    await setDoc(attachRef, { fileName: fileName, realName: realName, extension: extension, article: article }, { merge: false });
}

export async function createArticle(category, data, files, progressHandler, errorHandler, successHandler) {
    let totalBytes = 0;
    let transferred = [];
    for (let i = 0; i < files.length; i++) {
        totalBytes += files[i].size;
        transferred.push(0);
    }
    const id = createUUID();
    const articleRef = doc(db, category, id);
    await setDoc(articleRef, { ...data, id: id }, { merge: false });
    if (files.length > 0) {
        const uploads = [];
        const success = [];
        for (let i = 0; i < files.length; i++) {
            const fileName = createUUID();
            const extension = files[i].name.substring(files[i].name.lastIndexOf('.'));
            await createAttachmentData(fileName, files[i].name.substring(0, files[i].name.lastIndexOf('.')), extension, id);
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, files[i]);
            uploads.push(uploadTask);
            uploadTask.on('state_changed', (snapshot) => {
                transferred[i] = snapshot.bytesTransferred;
                let totalTransferred = 0;
                for (let j = 0; j < files.length; j++) {
                    totalTransferred += transferred[j];
                }
                progressHandler({ transferred: totalTransferred, total: totalBytes });
            }, (error) => {
                for (let i = 0; i < uploads.length; i++) {
                    uploads[i].cancel();
                }
                errorHandler();
            }, () => {
                success.push(0);
                if (success.length === files.length) {
                    successHandler();
                }
            });
        }
    } else if (files.length === 0) {
        successHandler();
    }
}

export async function editArticle(category, id, data, progressHandler, errorHandler, successHandler) {
    const originalArticle = await getArticle(category, id);
    let removeFiles = originalArticle.attachments.map(x => x.fileName);
    for (let i = 0; i < data.uploadedAttachs.length; i++) {
        removeFiles = removeFiles.filter(x => x !== data.uploadedAttachs[i].fileName);
    }
    for (let i = 0; i < removeFiles.length; i++) {
        await deleteObject(ref(storage, removeFiles[i]));
        await deleteDoc(doc(db, "attachments", removeFiles[i]));
    }
    const articleRef = doc(db, category, id);
    await setDoc(articleRef, {
        title: data.title,
        content: data.content
    }, { merge: true });
    if (data.newAttachs.length > 0) {
        let totalBytes = 0;
        let transferred = [];
        for (let i = 0; i < data.newAttachs.length; i++) {
            totalBytes += data.newAttachs[i].size;
            transferred.push(0);
        }
        const uploads = [];
        const success = [];
        for (let i = 0; i < data.newAttachs.length; i++) {
            const fileName = createUUID();
            const extension = data.newAttachs[i].name.substring(data.newAttachs[i].name.lastIndexOf('.'));
            await createAttachmentData(fileName, data.newAttachs[i].name.substring(0, data.newAttachs[i].name.lastIndexOf('.')), extension, id);
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, data.newAttachs[i]);
            uploads.push(uploadTask);
            uploadTask.on('state_changed', (snapshot) => {
                transferred[i] = snapshot.bytesTransferred;
                let totalTransferred = 0;
                for (let j = 0; j < data.newAttachs.length; j++) {
                    totalTransferred += transferred[j];
                }
                progressHandler({ transferred: totalTransferred, total: totalBytes });
            }, (error) => {
                for (let i = 0; i < uploads.length; i++) {
                    uploads[i].cancel();
                }
                errorHandler();
            }, () => {
                success.push(0);
                if (success.length === data.newAttachs.length) {
                    successHandler();
                }
            });
        }
    } else if (data.newAttachs.length === 0) {
        successHandler();
    }
}



export async function deleteArticle(category, id) {
    await deleteDoc(doc(db, category, id));
    const files = [];
    const q = query(collection(db, "attachments"), where("article", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        files.push(doc.data().fileName);
    });
    for (let i = 0; i < files.length; i++) {
        const fileRef = ref(storage, files[i]);
        await deleteObject(fileRef);
        await deleteDoc(doc(db, "attachments", files[i]));
    }
}

export async function deleteSeminar(id) {
    //Find Assignment
    let assignmentId = null;
    const assignmentQuery = query(collection(db, "assignment"), where("seminar", "==", id));
    const assignmentSnapshot = await getDocs(assignmentQuery);
    assignmentSnapshot.forEach((doc) => {
        assignmentId = doc.data().id;
    });
    if (assignmentId !== null) {
        //Delete Submit
        const submitQuery = query(collection(db, "assign-submit"), where("assignment", "==", assignmentId));
        const submitSnapshot = await getDocs(submitQuery);
        submitSnapshot.forEach(d => deleteDoc(doc(db, "assign-submit", d.id)));
        //Delete Assignment Files
        let findedAssignFiles = [];
        const assignFileQuery = query(collection(db, "attachments"), where("article", "==", assignmentId));
        const assignFileSnapshot = await getDocs(assignFileQuery);
        assignFileSnapshot.forEach((doc) => {
            findedAssignFiles.push(doc.data().fileName);
        });
        for (let i = 0; i < findedAssignFiles.length; i++) {
            await deleteObject(ref(storage, findedAssignFiles[i]));
            await deleteDoc(doc(db, "attachments", findedAssignFiles[i]));
        }
        //Delete Assignment
        await deleteDoc(doc(db, "assignment", assignmentId));
    }
    //Delete Seminar Files
    let findedSeminarFiles = [];
    const seminarFileQuery = query(collection(db, "attachments"), where("article", "==", id));
    const seminarFileSnapshot = await getDocs(seminarFileQuery);
    seminarFileSnapshot.forEach((doc) => {
        findedSeminarFiles.push(doc.data().fileName);
    });
    for (let i = 0; i < findedSeminarFiles.length; i++) {
        await deleteObject(ref(storage, findedSeminarFiles[i]));
        await deleteDoc(doc(db, "attachments", findedSeminarFiles[i]));
    }
    //Delete Seminar
    await deleteDoc(doc(db, "seminar_data", id));
}

export async function getArticle(category, id) {
    const articleRef = doc(db, category, id);
    const articleData = (await getDoc(articleRef)).data();
    const q = query(collection(db, "attachments"), where("article", "==", id));
    const querySnapshot = await getDocs(q);
    const attachments = [];
    querySnapshot.forEach((doc) => {
        attachments.push(doc.data());
    });
    return {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        createBy: articleData.createBy,
        createAt: articleData.createAt,
        timestamp: articleData.timestamp,
        thumbnail: await getArticleThumbnail(id),
        attachments: attachments
    };
}
export async function getArticlePageCount(category) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, category));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        articles.push(data);
    });
    return articles.length / 10;
}

export async function getArticles(category, page, thumbnail = false) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, category));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        articles.push(data);
    });
    articles = articles.sort((a, b) => b.timestamp - a.timestamp);
    if ((page - 1) * 10 >= articles.length) return [];
    if (page * 10 > articles.length) articles = articles.slice((page - 1) * 10, articles.length);
    else articles = articles.slice((page - 1) * 10, page * 10);
    if (thumbnail) {
        const newArticles = [];
        for (let i = 0; i < articles.length; i++) {
            newArticles.push({ ...articles[i], thumbnail: await getArticleThumbnail(articles[i].id) });
        }
        return newArticles;
    } else return articles;
}

export async function getSearchedArticles(category, search, page, thumbnail = false) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, category));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if ((data.title !== undefined && data.title.includes(search))
            || (data.content !== undefined && data.content.includes(search))
            || (data.createBy !== undefined && data.createBy.includes(search))
            || (data.createAt !== undefined && data.createAt.includes(search)))
            articles.push(data);
    });
    articles = articles.sort((a, b) => b.timestamp - a.timestamp);
    if (page * 10 > articles.length) articles = articles.slice((page - 1) * 10, articles.length);
    else articles = articles.slice((page - 1) * 10, page * 10);
    if (thumbnail) {
        const newArticles = [];
        for (let i = 0; i < articles.length; i++) {
            newArticles.push({ ...articles[i], thumbnail: await getArticleThumbnail(articles[i].id) });
        }
        return newArticles;
    } else return articles;
}

export async function getSearchedArticlePageCount(category, search) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, category));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if ((data.title !== undefined && data.title.includes(search))
            || (data.content !== undefined && data.content.includes(search))
            || (data.createBy !== undefined && data.createBy.includes(search))
            || (data.createAt !== undefined && data.createAt.includes(search)))
            articles.push(data);
    });
    return articles.length / 10;
}

export async function downloadFile(attachmentId) {
    const StorageRef = ref(storage, attachmentId);
    const result = await fetch(await getDownloadURL(StorageRef));
    return await result.blob();
}

export async function getArticleThumbnail(id) {
    const attachments = await getArticleImagesData(id);
    if (attachments.length > 0) {
        const StorageRef = ref(storage, attachments[0].fileName);
        return await getDownloadURL(StorageRef);
    } else {
        return null;
    }
}

async function getArticleImagesData(id) {
    const q = query(collection(db, "attachments"), where("article", "==", id));
    const querySnapshot = await getDocs(q);
    const attachments = [];
    querySnapshot.forEach((doc) => {
        const extension = doc.data().extension;
        if (extension.toLowerCase() === ".jpg" || extension.toLowerCase() === ".png" || extension.toLowerCase() === ".jpeg" || extension.toLowerCase() === ".gif")
            attachments.push(doc.data());
    });
    return attachments;
}

export async function getArticleImages(id) {
    const attachments = await getArticleImagesData(id);
    const urls = [];
    for (let i = 0; i < attachments.length; i++) {
        urls.push(await getDownloadURL(ref(storage, attachments[i].fileName)));
    }
    return urls;
}

export async function editSeminarData(id, files, data, progressHandler, errorHandler, successHandler){

    const originalArticle = await getSeminarData(id);
    let removeFiles = originalArticle.attachments.map(x => x.fileName);
    for (let i = 0; i < data.uploadedAttachs.length; i++) {
        removeFiles = removeFiles.filter(x => x !== data.uploadedAttachs[i].fileName);
    }
    for (let i = 0; i < removeFiles.length; i++) {
        await deleteObject(ref(storage, removeFiles[i]));
        await deleteDoc(doc(db, "attachments", removeFiles[i]));
    }
    const articleRef = doc(db, "seminar_data", id);
    await setDoc(articleRef, {
        title: data.title,
        content: data.content,
        assign_exist: data.assign_exist
    }, { merge: true });

    if(data.assign_exist){
        //과제가 존재하는지 체크하고 없으면 생성
        let assignment = null;
        const q = query(collection(db, "assignment"), where("seminar", "==", id));
        const assignmentSnapshot = await getDocs(q);
        assignmentSnapshot.forEach(d => assignment = d.data());
        if(assignment === null){
            await createAssignment({
                seminar: id,
                deadline: data.deadline
            })
        } else {
            assignment.deadline = data.deadline;
            await editAssignment(assignment);
        }
    } else {
        let assignment = null;
        const q = query(collection(db, "assignment"), where("seminar", "==", id));
        const assignmentSnapshot = await getDocs(q);
        assignmentSnapshot.forEach(d => assignment = d.data());
        if(assignment !== null){
            const submitQuery = query(collection(db, "assign-submit"), where("assignment" ,"==", assignment.id));
            const submitSnapshot = await getDocs(submitQuery);
            const filesKey = [];
            const submitKey = [];
            submitSnapshot.forEach(d => {
                filesKey.push(d.data().attachments);
                submitKey.push(d.id);
            });
            for(let i = 0; i < submitKey.length; i ++){
                await deleteDoc(doc(db, "assign-submit", submitKey[i]));
            }
            for(let i = 0; i < filesKey.length; i++){
                await deleteObject(ref(storage, filesKey[i]));
                await deleteDoc(doc(db, "attachments", filesKey[i]));
            }
            await deleteDoc(doc(db, 'assignment', assignment.id));
        }
    }

    //Attachment Upload

    if (files.length > 0) {
        let totalBytes = 0;
        let transferred = [];
        for (let i = 0; i < files.length; i++) {
            totalBytes += files[i].size;
            transferred.push(0);
        }
        const uploads = [];
        const success = [];
        for (let i = 0; i < files.length; i++) {
            const fileName = createUUID();
            const extension = files[i].name.substring(files[i].name.lastIndexOf('.'));
            await createAttachmentData(fileName, files[i].name.substring(0, files[i].name.lastIndexOf('.')), extension, id);
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, files[i]);
            uploads.push(uploadTask);
            uploadTask.on('state_changed', (snapshot) => {
                transferred[i] = snapshot.bytesTransferred;
                let totalTransferred = 0;
                for (let j = 0; j < files.length; j++) {
                    totalTransferred += transferred[j];
                }
                progressHandler({ transferred: totalTransferred, total: totalBytes });
            }, (error) => {
                for (let i = 0; i < uploads.length; i++) {
                    uploads[i].cancel();
                }
                errorHandler();
            }, () => {
                success.push(0);
                if (success.length === files.length) {
                    successHandler();
                }
            });
        }
    } else if (files.length === 0) {
        successHandler();
    }
}

export async function createSeminarData(data, files, progressHandler, errorHandler, successHandler) {
    let totalBytes = 0;
    let transferred = [];
    for (let i = 0; i < files.length; i++) {
        totalBytes += files[i].size;
        transferred.push(0);
    }
    const now = new Date();
    const seminarId = createUUID();
    const seminarRef = doc(db, 'seminar_data', seminarId);
    await setDoc(seminarRef, {
        title: data.title,
        content: data.content,
        id: seminarId,
        createAt: now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate(),
        assign_exist: data.assign_exist,
        timestamp: now
    }, { merge: false });
    if (data.assign_exist) {
        await createAssignment({
            seminar: seminarId,
            deadline: data.deadline
        })
    }
    if (files.length > 0) {
        const uploads = [];
        const success = [];
        for (let i = 0; i < files.length; i++) {
            const fileName = createUUID();
            const extension = files[i].name.substring(files[i].name.lastIndexOf('.'));
            await createAttachmentData(fileName, files[i].name.substring(0, files[i].name.lastIndexOf('.')), extension, seminarId);
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, files[i]);
            uploads.push(uploadTask);
            uploadTask.on('state_changed', (snapshot) => {
                transferred[i] = snapshot.bytesTransferred;
                let totalTransferred = 0;
                for (let j = 0; j < files.length; j++) {
                    totalTransferred += transferred[j];
                }
                progressHandler({ transferred: totalTransferred, total: totalBytes });
            }, (error) => {
                for (let i = 0; i < uploads.length; i++) {
                    uploads[i].cancel();
                }
                errorHandler();
            }, () => {
                success.push(0);
                if (success.length === files.length) {
                    successHandler();
                }
            });
        }
    } else if (files.length === 0) {
        successHandler();
    }
}

export async function getSeminarDatas(session, page) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, "seminar_data"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        articles.push(data);
    });
    for (let i = 0; i < articles.length; i++) {
        let assign = null;
        const q2 = query(collection(db, "assignment"), where("seminar", "==", articles[i].id));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => assign = doc.data());
        articles[i] = { ...articles[i], assign: assign };
    }
    for (let i = 0; i < articles.length; i++) {
        if (articles[i].assign !== null) {
            let submit = null;
            const q3 = query(collection(db, "assign-submit"), where("assignment", "==", articles[i].assign.id), where("member", "==", session.name + "(" + session.studentId + ")"));
            const querySnapshot3 = await getDocs(q3);
            querySnapshot3.forEach((doc) => submit = doc.data());
            articles[i] = { ...articles[i], submit: submit }
        }
    }
    articles = articles.sort((a, b) => b.timestamp - a.timestamp);
    if ((page - 1) * 10 >= articles.length) return [];
    if (page * 10 > articles.length) articles = articles.slice((page - 1) * 10, articles.length);
    else articles = articles.slice((page - 1) * 10, page * 10);
    return articles;
}

export async function getSeminarDataPageCount(assign=false) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, "seminar_data"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if(assign){
            if(data.assign_exist){
                articles.push(data);
            }
        } else {
            articles.push(data);
        }
    });
    return articles.length / 10;
}

export async function getSeminarSearchedDatas(session, search, page) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, "seminar_data"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title !== undefined && data.title.includes(search))
            articles.push(data);
    });
    for (let i = 0; i < articles.length; i++) {
        let assign = null;
        const q2 = query(collection(db, "assignment"), where("seminar", "==", articles[i].id));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => assign = doc.data());
        articles[i] = { ...articles[i], assign: assign };
    }
    for (let i = 0; i < articles.length; i++) {
        if (articles[i].assign !== null) {
            let submit = null;
            const q3 = query(collection(db, "assign-submit"), where("assignment", "==", articles[i].assign.id), where("member", "==", session.name + "(" + session.studentId + ")"));
            const querySnapshot3 = await getDocs(q3);
            querySnapshot3.forEach((doc) => submit = doc.data());
            articles[i] = { ...articles[i], submit: submit }
        }
    }
    articles = articles.sort((a, b) => b.timestamp - a.timestamp);
    if ((page - 1) * 10 >= articles.length) return [];
    if (page * 10 > articles.length) articles = articles.slice((page - 1) * 10, articles.length);
    else articles = articles.slice((page - 1) * 10, page * 10);
    return articles;
}

export async function getSeminarSearchedDataPageCount(search, assign=false) {
    let articles = [];
    const querySnapshot = await getDocs(collection(db, "seminar_data"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title !== undefined && data.title.includes(search))
            if(assign){
                if(data.assign_exist){
                    articles.push(data);
                }
            } else {
                articles.push(data);
            }
    });
    return articles.length / 10;
}

export async function getSeminarData(id) {
    const articleRef = doc(db, "seminar_data", id);
    const articleData = (await getDoc(articleRef)).data();
    const q = query(collection(db, "attachments"), where("article", "==", id));
    const querySnapshot = await getDocs(q);
    const attachments = [];
    querySnapshot.forEach((doc) => {
        attachments.push(doc.data());
    });
    let assign = null;
    if (articleData.assign_exist) {
        const q2 = query(collection(db, "assignment"), where("seminar", "==", id));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => assign = doc.data());
    }
    return {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        timestamp: articleData.timestamp,
        createAt: articleData.createAt,
        assign: assign,
        attachments: attachments
    };
}

async function createAssignment(data) {
    const assignmentId = createUUID();
    const assignRef = doc(db, 'assignment', assignmentId);
    await setDoc(assignRef, {
        ...data,
        id: assignmentId
    }, { merge: false });
}

async function editAssignment(data){
    const assignRef = doc(db, 'assignment', data.id);
    await setDoc(assignRef, data, { merge: true });
}

export async function submitAssignment(session, id, file, progressHandler, errorHandler, successHandler) {

    //Check Submitted Assignment
    let assigned = null;
    let assignedObject = null;
    const submitQuery = query(collection(db, "assign-submit"), where("assignment", "==", id), where("member", "==", session.name + "(" + session.studentId + ")"));
    const submitSnapshot = await getDocs(submitQuery);
    submitSnapshot.forEach(d => {
        assigned = d.id;
        assignedObject = d.data();
    });
    if(assigned !== null){
        await deleteObject(ref(storage, assignedObject.attachments));
        await deleteDoc(doc(db, "attachments", assignedObject.attachments));
        await deleteDoc(doc(db, "assign-submit", assigned));
    }
    const attachmentId = createUUID();
    const submitRef = doc(db, 'assign-submit', createUUID());
    await setDoc(submitRef, {
        assignment: id,
        attachments: attachmentId,
        member: session.name + "(" + session.studentId + ")",
        timestamp: new Date(),
        file: file.name
    }, { merge: false });
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    await createAttachmentData(attachmentId, file.name.substring(0, file.name.lastIndexOf('.')), extension, id);
    const storageRef = ref(storage, attachmentId);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', (snapshot) => {
        progressHandler({ transferred: snapshot.bytesTransferred, total: snapshot.totalBytes });
    }, (error) => {
        errorHandler();
    }, () => {
        successHandler();
    });

}

export async function getSubmitAssign(session, id) {
    let submit = null;
    const q2 = query(collection(db, "assign-submit"), where("assignment", "==", id), where("member", "==", session.name + "(" + session.studentId + ")"));
    const querySnapshot2 = await getDocs(q2);
    querySnapshot2.forEach((doc) => submit = doc.data());
    if (submit === null) return null;
    const q = query(collection(db, "attachments"), where("fileName", "==", submit.attachments));
    const querySnapshot = await getDocs(q);
    let attach = null;
    querySnapshot.forEach((doc) => attach = doc.data());
    return attach;
}

export async function getSubmits(id){
    const seminar = await getSeminarData(id);
    if(seminar.assign === null) return null;
    const assignId = seminar.assign.id;
    const submitQuery = query(collection(db, "assign-submit"), where("assignment","==",assignId));
    const submitSnapshot = await getDocs(submitQuery);
    const submits = [];
    submitSnapshot.forEach(d => submits.push(d.data()));
    return submits;
}