const container = document.getElementById("quote_container");
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
let last_quote;
let user;
let user_id;
let messages;
window.onload = loadQuotes();

async function loadQuotes()
{
    user = JSON.parse(localStorage.getItem("user"));
    user_id = user.id;
    let docRef = await firebase.firestore().collection("users").doc(user_id);
    let data;

    docRef.get().then((doc) => {
        if (doc.exists) {
            data = doc.data();
            document.getElementById("username").innerText = data.username;
            document.getElementById("message_button").setAttribute("data-mess-number", `${data.user_MessagesNumber}`);
            const quote_list = [...data.user_quotes];
            last_quote = quote_list[quote_list.length - 1];
            quote_list.forEach(q => {
                getQuote(q);
            })
        } else {
            console.log("Dokument ne postoji!");
        }
    }).catch((error) => {
        console.log("Greška:", error);
    });
}
document.getElementById("quotes_button").addEventListener("click", async() => {
    container.innerHTML = "";
    loadQuotes();
})
document.getElementById("message_button").addEventListener("click", async() => {
    container.innerHTML = "";
    let docRef = await firebase.firestore().collection("users").doc(user_id).get();
    let data = docRef.data();
    await firebase.firestore().collection("users").doc(user_id).update({user_MessagesNumber: 0});
    if(data.user_messages)
    {
        data.user_messages.forEach(message => {
            
            let x = document.createElement("div");
            x.innerHTML = `<p class="text-white">${message}</p> <button onclick="deleteMessage()">Delete</button>`;
            x.classList.add("message")
            container.appendChild(x);
        })
    }
})
async function getQuote(id)
{
    const fQoute = await firebase.firestore().collection("quotes").doc(id).get();
    const quote = fQoute.data();
    let x = document.createElement("div");
    x.innerHTML = `<p class="text-white quote">${quote.quote}</p>
    <button class="delete" data-id="${id}">Delete</button>`;
    x.classList.add("user_quote");
    container.appendChild(x);
    if(id === last_quote)
    {
        const buttons = document.querySelectorAll(".delete");
            buttons.forEach(button => {
                button.addEventListener("click", () => {
                    deleteUserQuote(button.dataset.id)
                })
            })
    }
}

async function deleteUserQuote(id)
{
    await firebase.firestore().collection("users").doc(user.id).update({user_quotes: firebase.firestore.FieldValue.arrayRemove(id)});
    await firebase.firestore().collection("quotes").doc(id).delete();
}

async function deleteMessage()
{
    const mess = event.target.parentElement.firstChild.innerText;
    await firebase.firestore().collection("users").doc(user.id).update({user_messages: firebase.firestore.FieldValue.arrayRemove(mess)});
}
