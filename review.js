const container = document.getElementById("container");
const hero = document.getElementById("hero");
const firebaseConfig = {
    apiKey: "AIzaSyBMQ76-Zg1rADbDj3NrqCy6HunYla2r6vQ",
    authDomain: "test-1a892.firebaseapp.com",
    projectId: "test-1a892",
    storageBucket: "test-1a892.appspot.com",
    messagingSenderId: "686282337574",
    appId: "1:686282337574:web:50cdbae0d5913e0e99a5e7",
    measurementId: "G-ZR9S7F046B"
  };

firebase.initializeApp(firebaseConfig);
let id;
window.onload = Start;

const getRequests = async() => {
    const firestoreReq = await firebase.firestore().collection("quotes_review").get();
    
    const Requests = firestoreReq.docs.map(req => ({
        ...req.data(),
        id: req.id
    }));

    return Requests;
}

async function Start()
{
    const user = await getUser();
    if(!user.admin) window.location.href = "index.html";
    const requests = await getRequests();
    if(requests <= 0) container.innerHTML = "<h2>No requests</h2>"
    else 
    {
        requests.forEach(req => {
            let x = document.createElement("div");
            container.appendChild(x);
            x.setAttribute("data-id", `${req.id}`)
            x.innerHTML = `<p>${req.quote}</p>
            <button class="buttons" id="accept_button" onclick="choseFun(this)">ACCEPT</button>
            <button class="buttons" id="decline_button" onclick="choseFun(this)">DECLINE</button>
            <hr>`
        })
    }
}

function choseFun()
{
    if(event.target.getAttribute("id") == "accept_button")
    {
        id = event.target.parentElement.dataset.id;
        addQuote(id);
    }
    else 
    {
        id = event.target.parentElement.dataset.id;
        document.getElementById("res_modal").classList.add("d-flex");
        document.getElementById("res_modal").classList.remove("d-none");
    }
    
}
async function getUser()
{
    const info = JSON.parse(localStorage.getItem("user"));
    const user = await firebase.firestore().collection("users").doc(info.id).get();
    const userData = user.data();
    return userData;
}
async function confirmDel()
{
    const fQuote = await firebase.firestore().collection("quotes_review").doc(id).get();
    const quoteData = fQuote.data();
    const message = `Your quote "${quoteData.quote}" is declined. \nReason: ${document.getElementById("reason").value}`;
    user_id = quoteData.user_id;
    await firebase.firestore().collection("users").doc(user_id).update({user_MessagesNumber: firebase.firestore.FieldValue.increment(1)});
    await firebase.firestore().collection("users").doc(user_id).update({user_messages: firebase.firestore.FieldValue.arrayUnion(message)});
    removeQuote(id);
}
async function addQuote(id)
{
    const req = await getRequests();
    const accepted_req = req.find(r => r.id === id);
    const new_quote = {
        quote: accepted_req.quote,
        user: accepted_req.user,
        user__id: accepted_req.user_id,
        time: firebase.firestore.FieldValue.serverTimestamp()
    }
    const user = await firebase.firestore().collection("users").doc(accepted_req.user_id);
    let userData;
    await user.get().then((doc) => {
        userData = doc.data();
    })
    const mess = `Your quote "${new_quote.quote}" is accepted.`
    await user.update({user_MessagesNumber: firebase.firestore.FieldValue.increment(1)});
    await user.update({user_messages: firebase.firestore.FieldValue.arrayUnion(mess)});
    const added_Quote = await firebase.firestore().collection("quotes").add(new_quote);
    await firebase.firestore().collection("quotes_review").doc(id).delete();
    await user.update({user_quotes: firebase.firestore.FieldValue.arrayUnion(added_Quote.id)});
    container.innerHTML = "";
    Start();
}
async function removeQuote(id)
{
    container.innerHTML = "";
    await firebase.firestore().collection("quotes_review").doc(id).delete();
    Start();
}