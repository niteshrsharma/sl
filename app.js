const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const dbFilePath = path.join(__dirname, "db.json");

app.use(express.json());
app.use("/", express.static("public"));

function generatePlaceholder() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function isPlaceholderUnique(db, placeholder) {
    return !db.some(entry => entry.placeholder === placeholder);
}

app.get("/:link", (req, res) => {
    const linkPlaceholder = req.params.link;

    // Read the database
    fs.readFile(dbFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading db.json:", err);
            return res.status(500).send("Server error");
        }

        // Parse the database
        let db = [];
        try {
            db = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing db.json:", e);
            return res.status(500).send("Server error");
        }

        const entry = db.find(item => item.placeholder === linkPlaceholder);
        if (entry) {
            return res.redirect(entry.link);
        } else {
            return res.status(404).send("Link not found");
        }
    });
});

function handleLinkStore(req, res) {
    const link = req.body.link;  // Retrieve the link from the request body
    if (!link || !link.startsWith("http")) {
        return res.status(400).send("Invalid link provided");
    }

    // Load the existing database from db.json
    fs.readFile(dbFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading db.json:", err);
            return res.status(500).send("Server error");
        }

        let db = [];
        try {
            db = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing db.json:", e);
        }

        let placeholder;
        do {
            placeholder = generatePlaceholder();
        } while (!isPlaceholderUnique(db, placeholder));

        const newEntry = {
            placeholder,
            link
        };

        db.push(newEntry);

        fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                console.error("Error writing to db.json:", err);
                return res.status(500).send("Server error");
            }

            // Respond to the client
            res.send({ message: "Link stored successfully", placeholder });
        });
    });
}

app.post("/store-link", handleLinkStore);

app.listen(3000,'0.0.0.0', () => {
    console.log("listening on port 3000");
});
