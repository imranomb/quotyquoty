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

const close_button = document.querySelectorAll(".close_button")
const form_btns = document.querySelectorAll(".form_btn");
let id_show = "d-none";
let last_quote;
let first = true;
let filter = "time";
let logged;
let filters = document.querySelectorAll(".filter");

window.onload = setQuotes();


document.getElementById("login_register").addEventListener("click", () => {
    document.getElementById("login_register_modal").classList.toggle("unactive");
    document.getElementById("login_register_modal").classList.toggle("active");
})
document.getElementById("close_register").addEventListener("click", () => {
    document.getElementById("login_register_modal").classList.toggle("active");
    document.getElementById("login_register_modal").classList.toggle("unactive");
})

close_button.forEach(btn => {
    btn.addEventListener("click", () => {
        const x = btn.parentElement.parentElement;
        x.parentElement.classList.remove("d-flex");
        x.parentElement.classList.add("d-none");
    })
})
const get_data = async () => {
    const firebaseUsers = await firebase.firestore().collection("users").get();
    let users = firebaseUsers.docs.map(user => ({
        ...user.data(),
        id: user.id
    }));
    return users;
}
document.getElementById("login_button").addEventListener("click", async() => {

    const users = await get_data();
    const username = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;

    const login_user = users.find(user => user.username === username && user.password === password);

    if(!!login_user)
    {
        const localInfo = {
            id: login_user.id,
            username: username,
            admin: login_user.admin
        }
        localStorage.setItem("user", JSON.stringify(localInfo));
        document.getElementById("login_register_modal").classList.toggle("active");
        document.getElementById("login_register_modal").classList.toggle("unactive");
        loginCheck();
    }
    else 
    {
        window.alert("Wrong data!")
    }
})
document.getElementById("register_button").addEventListener("click", async() => {

    if(document.getElementById("register_username").value == "" || document.getElementById("register_mail").value == "" || document.getElementById("register_password").value == "")
    {
        document.getElementById("modal_text").innerText = "Fill all required fields!";
        return;
    }

    const new_user =
    {
        username: document.getElementById("register_username").value,
        mail: document.getElementById("register_mail").value,
        password: document.getElementById("register_password").value,
        admin: false,
        user_quotes: [],
        votes: []
    }

    const users = await get_data();
    let potentional_user = users.find(user => user.username === new_user.username || user.mail === new_user.mail);
    if(!!potentional_user)
    {
        document.getElementById("modal_text").innerText = "Account with that info alrey exists!";
    }
    else
    {
        const createdUser = await firebase.firestore().collection("users").add(new_user);
        const localInfo = {
            id: createdUser.id,
            username: new_user.username,
            admin: new_user.admin,
        }
        console.log(localInfo)
        localStorage.setItem("user", JSON.stringify(localInfo));
        loginCheck();
    }
})
document.addEventListener("click", e => {
    if(e.target.matches("#profile")) document.getElementById("custom-dropdown-menu").classList.toggle("active");
    else 
    {
        if(document.getElementById("custom-dropdown-menu").classList.contains("active")) document.getElementById("custom-dropdown-menu").classList.toggle("active");
    }
})
document.getElementById("profile_panel").addEventListener("click", () => {
    window.location.href = "profile.html";
})
document.getElementById("log_out").addEventListener("click", () => {
    localStorage.removeItem("user");
    loginCheck();
})
document.getElementById("post_button").addEventListener("click", async() => {
    const current_user = JSON.parse(localStorage.getItem("user"));
    const new_quote =
    {
        quote: `${document.getElementById("quote_text").value}`,
        user: current_user.username,
        user_id: current_user.id
    }
    await firebase.firestore().collection("quotes_review").add(new_quote);
    let x = document.getElementById("write_modal");
    x.classList.remove("d-block");
    x.classList.add("d-none");
    hero.innerHTML = "";
    first = true;
    createLoad();
    setQuotes();
})
document.getElementById("write_quote").addEventListener("click", () => {
    document.getElementById("write_modal").classList.toggle("d-flex");
    document.getElementById("write_modal").classList.toggle("d-none");
})
function loginCheck()
{
    if(!!localStorage.getItem("user"))
    {
        document.getElementById("buttons").classList.add("d-none");
        document.getElementById("login_buttons").classList.remove("d-none");
        document.getElementById("login_buttons").classList.add("d-block");
        const user = JSON.parse(localStorage.getItem("user"));
        logged = true;
        if(user.admin)
        {
            document.getElementById("admin_panel").className = "d-block btn btn-primary"
            id_show = "d-block";
        }
        else
        {
            document.getElementById("admin_panel").className = "d-none";
            id_show = "d-none";
        }
    }
    else
    {
        document.getElementById("buttons").classList.add("d-block");
        document.getElementById("buttons").classList.remove("d-none");
        document.getElementById("login_buttons").classList.add("d-none");
        logged = false;
        localStorage.removeItem("user");
    }
}
document.getElementById("admin_panel").addEventListener("click", () => {
    window.location.href = "review_panel.html";
})
const voteCheck = async(quote_id) => {
    let voteInfo = {voted: "", color: ""};
    const current_user = JSON.parse(localStorage.getItem("user"));
    const user = await firebase.firestore().collection("users").doc(current_user.id).get();
    const user_info = user.data();
    const str = `"${quote_id}"`;
    const pVote = user_info.votes.find(vote => vote === str);
    if(!!pVote)
    {
        voteInfo.voted = "voted";
        voteInfo.color = "#fc0345"
    }else 
    {
        voteInfo.voted = "notVoted";
        voteInfo.color = "#ffffff"
    }
    return voteInfo;
}
async function getFirstQuote()
{
    const firestoreQuotes = await firebase.firestore().collection("quotes").orderBy(filter, "desc").limit(10).get();

    const quotes = firestoreQuotes.docs.map(quote => ({
        ...quote.data(),
        id: quote.id
    }));
    last_quote = quotes[quotes.length-1];
    first = false;
    return quotes;
}
async function getQuotes()
{
    const firestoreQuotes = await firebase.firestore().collection("quotes").orderBy(filter, "desc").startAfter(last_quote.quote).limit(2).get();

    const quotes = firestoreQuotes.docs.map(quote => ({
        ...quote.data(),
        id: quote.id
    }));
    last_quote = quotes[quotes.length-1];
    return quotes;
}
async function setQuotes()
{
    let quotes;
    if(first)
    {
        quotes = await getFirstQuote();
        loginCheck();
    }
    else
    {
        quotes = await getQuotes();
        window.removeEventListener("scroll", s)
        if(quotes === 0) return;
    }
    if(!!document.getElementById("load")) document.getElementById("load").remove();
    for(quote of quotes)
    {
        let voteeCheck;
        if(logged) voteeCheck = await voteCheck(quote.id);
        else
        {
            voteeCheck = {voted: "notVoted", color: "#ffffff"}
        } 
        let x = document.createElement("div");
        hero.appendChild(x);
        x.innerHTML = `<h4>${quote.quote}</h4> 
        <div class"d-flex">
            <p id="signature">${quote.user}</p>
            <div class="up_votes d-flex gap-2 align-items-center">
                <i onclick="upVote(this)" data-id="${quote.id}" class="fa-solid fa-arrow-up my-2 ${voteeCheck.voted}" style="color: ${voteeCheck.color};"></i>
                <span id="up_votes" data-votes=${quote.votes}>${quote.votes}</span>
            </div>
        </div>
        <button type="button" class="delete ${id_show} btn btn-danger" data-id=${quote.id} onclick="funDelete()">Delete</button>`
        x.classList.add("quote");
    }
    if(document.getElementById("intro"))
    {
        setTimeout(function() {
            document.getElementById("intro").remove()
        }, 2000)
    };
}

window.addEventListener("scroll", s = () => {
    if(window.innerHeight + window.pageYOffset >= document.body.offsetHeight)
    {
        scrollData();
    }
})

async function scrollData()
{
    createLoad();
    setQuotes();
}

async function upVote(e)
{
    if(logged)
    {
        const quote_id = e.dataset.id;
        const current_user = JSON.parse(localStorage.getItem("user"));
        if(e.classList.contains("voted"))
        {
            e.parentElement.childNodes[3].dataset.votes--;
            e.style.color = "#ffffff";
            e.classList.remove("voted");
            e.classList.add("notVoted");
            await firebase.firestore().collection("users").doc(current_user.id).update({votes: firebase.firestore.FieldValue.arrayRemove(`"${quote_id}"`)});
            await firebase.firestore().collection("quotes").doc(quote_id).update({votes: firebase.firestore.FieldValue.increment(-1)});
        }else 
        {
            e.parentElement.childNodes[3].dataset.votes++;
            e.style.color = "#eb3434";
            e.classList.remove("notVoted");
            e.classList.add("voted");
            await firebase.firestore().collection("users").doc(current_user.id).update({votes: firebase.firestore.FieldValue.arrayUnion(`"${quote_id}"`)});
            await firebase.firestore().collection("quotes").doc(quote_id).update({votes: firebase.firestore.FieldValue.increment(1)});
        }
        e.parentElement.childNodes[3].innerText = e.parentElement.childNodes[3].dataset.votes;
    }else 
    {
        window.alert("Please login first.")
    }
}

async function funDelete()
{
    const id = event.target.dataset.id;
    hero.innerHTML = "";
    const firestoreQuote = await firebase.firestore().collection("quotes").doc(id).get();
    const quote = firestoreQuote.data();
    await firebase.firestore().collection("users").doc(quote.user__id).update({user_quotes: firebase.firestore.FieldValue.arrayRemove(id)});
    await firebase.firestore().collection("quotes").doc(id).delete();
    first = true;
    createLoad();
    setQuotes();
}
function createLoad()
{
    const load = document.createElement("div");
    load.id = "load";
    load.classList.add("mt-10")
    hero.appendChild(load);
}
document.getElementById("resetPassword_modal").addEventListener("click", () => {
    let x = document.getElementById("reset-password-modul");
    x.classList.remove("d-none");
    x.classList.add("d-flex");
})

filters.forEach(filter_button => {
    filter_button.addEventListener("click", (event) => {
        first = true;
        const x = filter_button.parentElement;
        filter_button.parentElement.childNodes[3].style.backgroundColor = "transparent";
        filter_button.parentElement.childNodes[5].style.backgroundColor = "transparent";
        console.log(x)
        if(filter_button.classList.contains("newest"))
        {
            filter = "time";
        }else 
        {
            filter = "votes";
        }
        event.target.style.backgroundColor = "silver"
        hero.innerHTML = "";
        createLoad();
        setQuotes();
    
        })
})

async function passwordReset()
{
    const username = document.getElementById("username_txt").value;
    const firestoreUsers = await firebase.firestore().collection("users").get();
    let users = firestoreUsers.docs.map(user => ({
        ...user.data(),
        id: user.id
    }));
    const posUser = users.find(user => user.username === username);
    if(!!posUser) 
    {
        let res = await fetch('https://www.psswrd.net/api/v1/password/?length=17&lower=1&upper=0&int=1&special=0') .then((res)=> res.json());
        const code = posUser.id + res;
        await firebase.firestore().collection("users").doc(posUser.id).update({passReset: code})
        const url = new URL("http://127.0.0.1:5500/password_reset.html")
        url.searchParams.set("code", code.toString());
        sendMail(posUser.mail, url)
    }
    
}
function sendMail(mail, code)
{
    Email.send({
        Host : "smtp.elasticemail.com",
        Username : "imran2018omerbasic@gmail.com",
        Password : "59454E5F290FC87C47D3AEC82B2ACF6334D8",
        To : mail,
        From : "imran2018omerbasic@gmail.com",
        Subject : "Password reset",
        Body : `Your code is: ${code}`,
      }).then(
        window.alert("Check you email for instructions to reset your password.")
      );
}





































