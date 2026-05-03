const h1 = document.querySelector("h1")
const currentUser = sessionStorage.getItem("currentUser")
h1.textContent = `שלום ${JSON.parse(currentUser).firstName} בוא נצלול פנימה`

async function update() {
    const userId = JSON.parse(currentUser).userId;

    const userName = document.querySelector("#userName").value
    const firstName = document.querySelector("#firstName").value
    const lastName = document.querySelector("#lastName").value
    const password = document.querySelector("#password").value

    let updateUserData = {
        userId,
        firstName,
        lastName,
        userName,
        password
    };

    console.log(updateUserData, userId);
    const response = await fetch(`api/Users/${userId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateUserData)
        });
    
    
    if (response.status == 204) {
        const userData = await response;
        sessionStorage.setItem("user", JSON.stringify(updateUserData));
        alert("עודכנו הפרטים")
    }
    else {
        alert("הכנס סיסמא חזקה יותר")
    }
    

}