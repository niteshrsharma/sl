const express = require("express");
const fs = require("fs");
const path = require("path");
const validUrl = require("valid-url");
const axios = require("axios");
const PORT=3008
const app = express();
const dbFilePath = path.join(__dirname, "db.json");

app.use(express.json());
app.use("/", express.static("public"));

async function readDatabase() {
    const data = await fs.promises.readFile(dbFilePath, "utf8");
    return JSON.parse(data);
}

async function writeDatabase(db) {
    await fs.promises.writeFile(dbFilePath, JSON.stringify(db, null, 2));
}

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

app.get("/:link", async (req, res) => {
    const linkPlaceholder = req.params.link;

    try {
        const db = await readDatabase();
        const entry = db.find(item => item.placeholder === linkPlaceholder);
        if (entry) {
            // Increment the click count
            entry.clickCount = (entry.clickCount || 0) + 1;
            await writeDatabase(db);
            return res.redirect(entry.link);
        } else {
            return res.status(404).send("Link not found");
        }
    } catch (err) {
        console.error("Error handling request:", err);
        return res.status(500).send("Server error");
    }
});

async function validateLink(link) {
    try {
        const response = await axios.head(link);
        return response.status >= 200 && response.status < 400;
    } catch (error) {
        return false;
    }
}

async function handleLinkStore(req, res) {
    let link = req.body.link;

    if (!link) {
        return res.status(400).send("Please provide a link");
    }

    if (!/^https?:\/\//i.test(link)) {
        link = 'https://' + link;
    }

    if (!validUrl.isUri(link)) {
        return res.status(400).send("Invalid link provided");
    }

    let isValid = await validateLink(link);
    if (!isValid) {
        const httpLink = link.replace(/^https:\/\//i, 'http://');
        isValid = await validateLink(httpLink);
        if (!isValid) {
            return res.status(400).send("Invalid link provided");
        } else {
            link = httpLink;
        }
    }

    try {
        const db = await readDatabase();
        let placeholder;
        do {
            placeholder = generatePlaceholder();
        } while (!isPlaceholderUnique(db, placeholder));

        const newEntry = {
            placeholder,
            link,
            clickCount: 0
        };

        db.push(newEntry);
        await writeDatabase(db);
        res.send({ message: "Link stored successfully", placeholder });
    } catch (err) {
        console.error("Error handling store request:", err);
        res.status(500).send("Server error");
    }
}

async function getClickCount(req, res) {
    const linkPlaceholder = req.params.placeholder;

    try {
        const db = await readDatabase();
        const entry = db.find(item => item.placeholder === linkPlaceholder);
        if (entry) {
            return res.send({ clickCount: entry.clickCount });
        } else {
            return res.status(404).send("Link not found");
        }
    } catch (err) {
        console.error("Error retrieving click count:", err);
        return res.status(500).send("Server error");
    }
}

app.post("/store-link", handleLinkStore);
app.get("/get-click-count/:placeholder", getClickCount);

app.listen(PORT, '0.0.0.0', () => {
    console.log("Listening on port ", PORT);
});
