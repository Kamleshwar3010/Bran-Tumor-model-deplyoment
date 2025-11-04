// Get the form and button elements
let form = document.getElementById("predictionForm");

form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Stop the page from reloading

    console.log("Predict Button Clicked!");

    // Get user inputs
    let name = document.getElementById("name").value;
    let age = document.getElementById("age").value;
    let gender = document.querySelector('input[name="gender"]:checked')?.value;
    let email = document.getElementById("email").value;
    let fileInput = document.getElementById("imageInput").files[0];

    // Validate file input
    if (!fileInput) {
        alert("Please upload an MRI image.");
        return;
    }

    // Create FormData to send file and details
    let formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("email", email);
    formData.append("file", fileInput);

    // Read the image file as base64 before submitting
    const reader = new FileReader();
    reader.onloadend = async function () {
        // Get the base64 encoded image data
        const base64Image = reader.result;

        // Store the prediction data along with the base64 image in localStorage
        localStorage.setItem("predictionData", JSON.stringify({
            name: name,
            age: age,
            gender: gender,
            email: email,
            imageUrl: base64Image,  // Store the base64 string instead of Blob URL
            prediction: null  // Set prediction to null for now, we will set it after server response
        }));

        try {
            // Send the FormData to Flask backend
            let response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                body: formData
            });

            // Ensure response is JSON
            if (!response.ok) {
                let errorData = await response.json();
                throw new Error(errorData.error || "Failed to process the request.");
            }

            let data = await response.json();
            console.log("Prediction Result:", data.prediction);

            // Update the prediction in localStorage
            const predictionData = JSON.parse(localStorage.getItem("predictionData"));
            predictionData.prediction = data.prediction;  // Set the prediction result
            localStorage.setItem("predictionData", JSON.stringify(predictionData));

            // Redirect to the report page
            window.location.href = "/report";  // Flask route for report page

        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    // Read the image file as base64 string
    reader.readAsDataURL(fileInput);
});
