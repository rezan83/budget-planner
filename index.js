const addForm = document.getElementById("addForm");
const error = document.getElementById("error");

addForm.addEventListener("submit", handelSubmit);

function handelSubmit(e) {
    e.preventDefault();
    let formData = new FormData(addForm);
    let data = Object.fromEntries(formData);
    for (const [key, val] of Object.entries(data)) {
        if (!val) {
            error.textContent = `${key} is required`;
            return;
        }
        error.textContent = "";
    }
    data.cost = parseInt(data.cost);

    db.collection("expenses")
        .add(data)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            addForm.reset();
            error.textContent = "";
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
            error.textContent = "something went wrong";
        });
}
