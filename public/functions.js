document.addEventListener("DOMContentLoaded", () => {
    const linkForm = document.getElementById("linkForm");
    const linkInput = document.getElementById("linkInput");
    const shortenedLinkElement = document.getElementById("shortenedLink");
    const checkCountButton = document.getElementById("checkCountButton");
    const placeholderInput = document.getElementById("placeholderInput");
    const checkCountResult = document.getElementById("checkCountResult");
    const loader=document.querySelector(".loader");
    // Handle the link shortening form submission
    linkForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const link = linkInput.value;
        try {
            loader.style.display="block";
            const response = await axios.post("/store-link", { link });
            if (response.data.placeholder) {
                shortenedLinkElement.href = `${window.location.origin}/${response.data.placeholder}`;
                shortenedLinkElement.textContent = `${window.location.origin}/${response.data.placeholder}`;
            }
        } catch (error) {
            console.error("Error shortening link:", error);
            alert("Failed to shorten the link. Please try again.");
        }finally{
            loader.style.display="none";
        }
    });

    // Handle the click count check
    checkCountButton.addEventListener("click", async () => {
        const fullLink = placeholderInput.value.trim(); // Get the full link from input

        if (!fullLink) {
            alert("Please enter a placeholder.");
            return;
        }

        // Extract the placeholder from the full link
        const parts = fullLink.split('/');
        const placeholder = parts.pop(); // Get the last part of the URL

        try {
            const response = await axios.get(`/get-click-count/${placeholder}`); // Send only the placeholder
            loader.style.display="block";
            checkCountResult.textContent = `Click Count: ${response.data.clickCount}`;
        } catch (error) {
            console.error("Error checking click count:", error);
            checkCountResult.textContent = "Failed to retrieve click count. Please check the placeholder.";
        }finally{
            loader.style.display="none";
        }
    });
});
