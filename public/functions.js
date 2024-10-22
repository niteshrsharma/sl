document.getElementById("linkForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const linkInput = document.getElementById("linkInput").value;
    const resultMessage = document.getElementById("resultMessage");

    // Make the POST request using Axios
    axios.post("/store-link", { link: linkInput })
        .then(function(response) {
            const placeholder = response.data.placeholder;
            resultMessage.innerHTML = `<p>Link stored successfully! Your placeholder is: <strong>${placeholder}</strong></p>
                                       <p>Here is your shortened link: <a href="${window.location.protocol}//${window.location.hostname}:${window.location.port}/${placeholder}" target="_blank">${window.location.protocol}//${window.location.hostname}:${window.location.port}/${placeholder}</a></p>`;
        })
        .catch(function(error) {
            console.error(error);
            resultMessage.innerHTML = "<p>There was an error storing your link. Please try again.</p>";
        });
});