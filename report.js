document.addEventListener("DOMContentLoaded", function () {
    let reportData = JSON.parse(localStorage.getItem("predictionData"));

    if (reportData) {
        document.getElementById("name").textContent = reportData.name;
        document.getElementById("age").textContent = reportData.age;
        document.getElementById("gender").textContent = reportData.gender;
        document.getElementById("email").textContent = reportData.email;
        document.getElementById("uploadedImage").src = reportData.imageUrl;  // Set the image URL in the src tag
        document.getElementById("result").textContent = `Prediction: ${reportData.prediction}`;
    } else {
        document.body.innerHTML = "<h2>No prediction data found. Please go back and try again.</h2>";
    }
});

document.getElementById("downloadReportBtn").addEventListener("click", function () {
    // Retrieve the prediction data from localStorage
    let reportData = JSON.parse(localStorage.getItem("predictionData"));

    if (reportData) {
        // Create a PDF using jsPDF
        const { jsPDF } = window.jspdf;  // Access jsPDF from the library
        const doc = new jsPDF();

        // Set font for title (bold and large)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);

        // Title text and centering it
        const title = "Brain Tumor Prediction Report";
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2; // Center-align the title

        // Add centered title to the PDF
        doc.text(title, titleX, 20);  // Draw the title at the center and position it on top

        // Draw a horizontal line below the title
        doc.setLineWidth(0.5);
        doc.line(10, 25, pageWidth - 10, 25);  // Draw line from left to right, below the title

        // Reset font for content (normal font)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        // Function to add bold label and normal value
        const addBoldLabelNormalValue = (label, value, yPosition) => {
            // Set label as bold
            doc.setFont("helvetica", "bold");
            doc.text(label, 10, yPosition);  // Add label in bold

            // Set value as normal
            doc.setFont("helvetica", "normal");
            doc.text(value, 40, yPosition);  // Add value in normal font
        };

        // Add user details with bold label and normal value
        let currentY = 35;
        addBoldLabelNormalValue("Name:", reportData.name, currentY);
        currentY += 10;  // Adjust position for next text
        addBoldLabelNormalValue("Age:", reportData.age, currentY);
        currentY += 10;
        addBoldLabelNormalValue("Gender:", reportData.gender, currentY);
        currentY += 10;
        addBoldLabelNormalValue("Email:", reportData.email, currentY);
        currentY += 10;
        addBoldLabelNormalValue("Prediction:", reportData.prediction, currentY);
        currentY += 10;

        // Add the image (if needed)
        if (reportData.imageUrl) {
            const base64Image = reportData.imageUrl;  // Directly use the base64 string from localStorage
            doc.addImage(base64Image, 'JPEG', 10, currentY, 180, 160);  // Add image to PDF at position (10, currentY)
            doc.save("prediction_report.pdf");  // Save the PDF after adding the image
        } else {
            doc.save("prediction_report.pdf");  // Save the PDF if no image is available
        }
    } else {
        alert("No report data found to download.");
    }
});
