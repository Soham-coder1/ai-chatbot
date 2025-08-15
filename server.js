let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatcontainer = document.querySelector(".chat-container");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCn70_n3xe_0uJaYbY0qtns-tARO4WUfjQ"

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    // Build parts array conditionally
    let parts = [{ text: user.message }];
    if (user.file.data) {
        parts.push({ inline_data: user.file });
    }

    let RequestOption = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: parts
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();

        let apiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
            ?.replace(/\*\*(.*?)\*\*/g, "$1")
            ?.trim() || "AI did not respond.";

        text.innerHTML = apiResponse;

    } catch (error) {
        console.log("Something Error:", error);
        text.innerHTML = "Something went wrong 404";
    } finally {
        chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });
        user.file = { mime_type: null, data: null };
        preview.style.display = "none";
        preview.src = "";
        user.file={};
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(message) {
    user.message = "Write only valid C,python,java,html,css,javascript,c## code without extra explanation. " + message.trim();
    user.message = message.trim();
    if (!user.message) return;

    let userHTML = `
    <img src="user.jpg" alt="" id="userImage" width="8%">
    <div class="user-chat-area">
        ${user.message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>` : ""}
    </div>
    `;
    prompt.value = "";

    let userChatBox = createChatBox(userHTML, "user-chat-box");
    userChatBox.style.display = "flex";
    chatcontainer.appendChild(userChatBox);

    chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHTML = `
            <img src="Ai.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="discord-typing.gif" alt="typing..." class="load" width="50px">
            </div>
        `;
        let aiChatBox = createChatBox(aiHTML, "ai-chat-box");
        chatcontainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && prompt.value.trim()) {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value);
})





imageBtn.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            let base64string = e.target.result.split(",")[1];
            user.file = {
                mime_type: file.type,
                data: base64string
            };
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});
