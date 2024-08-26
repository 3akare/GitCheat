const cron = require("node-cron");
const execSync = require("child_process").execSync;
const path = require("path");
const fs = require("fs");
const express = require("express");
require("dotenv").config()

const app = express();
const port = 8080;
const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/3akare/GitCheat.git`;
const repoName = "GitCheat";
const repoPath = path.resolve(__dirname, repoName);

// Function to execute a Git command in the context of the repository
const execGitCommand = (command) => {
    return execSync(command, { cwd: repoPath, encoding: 'utf-8' });
};

const pushToGithub = () => {
    console.log(execGitCommand("git status"));
    execGitCommand("git add .");
    execGitCommand('git commit -m "feat: GitCheat Commit"');
    execGitCommand("git push");
};

app.get("/", (req, res) => {
    try {
        pushToGithub();
    } catch (error) {
        // If repository doesn't exist, clone it
        if (!fs.existsSync(repoPath)) {
            execSync(`git clone ${repoUrl} ${repoPath}`);
        }
        pushToGithub();
    }
    return res.json({ status: "ok" });
});

// Cron job to append to a file and push changes to GitHub every minute
cron.schedule('0/240 * * * *', () => {
    const filePath = path.join(repoPath, "updated.txt");
    fs.appendFileSync(filePath, "Hello world\n", err => {
        if (err) {
            console.error(err);
        } else {
            pushToGithub();
        }
    });
});

app.listen(port, () => {
    console.log("Listening on port " + port);
    // Configure Git user settings globally (once)
    execSync('git config --global user.name "3akare"');
    execSync('git config --global user.email "bakaredavid007@gmail.com"');

    // Clone the repository initially if it doesn't exist
    if (!fs.existsSync(repoPath)) {
        execSync(`git clone ${repoUrl} ${repoPath}`);
    }
});
