const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const LOCAL_PATH = path.join(__dirname, "docs");
const BROWSER_PATH = path.join(LOCAL_PATH, "browser");
const EXCLUDED_FILES = [path.normalize("public/data.json")];

function isExcluded(localPath) {
  const relative = path.relative(LOCAL_PATH, localPath);
  return EXCLUDED_FILES.includes(path.normalize(relative));
}

// Déplace tout le contenu de browser vers docs
function moveBrowserContent() {
  if (!fs.existsSync(BROWSER_PATH)) return;
  const files = fs.readdirSync(BROWSER_PATH);
  for (const file of files) {
    const src = path.join(BROWSER_PATH, file);
    const dest = path.join(LOCAL_PATH, file);
    fs.renameSync(src, dest);
  }
  fs.rmdirSync(BROWSER_PATH);
}

function gitCommitPush() {
  try {
    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "deploy"', { stdio: "inherit" });
    execSync("git push", { stdio: "inherit" });
  } catch (err) {
    console.log("Git commit/push ignoré (peut-être pas de changements).");
  }
}

async function removeExceptBackend(client, dir) {
  const list = await client.list(dir);
  for (const item of list) {
    if (item.name === "backend") continue;
    if (item.name === "adminccb") continue;
    if (item.name === "intraccb") continue;
    const remotePath = `${dir}/${item.name}`;
    if (item.isDirectory) {
      await client.removeDir(remotePath);
    } else {
      await client.remove(remotePath);
    }
  }
}

async function uploadDir(client, localDir, remoteDir) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const localPath = path.join(localDir, file);
    if (isExcluded(localPath)) {
      console.log("Fichier ignoré :", localPath);
      continue;
    }

    const remotePath = `${remoteDir}/${file}`;
    if (fs.lstatSync(localPath).isDirectory()) {
      await client.ensureDir(remotePath);
      await uploadDir(client, localPath, remotePath);
    } else {
      await client.uploadFrom(localPath, remotePath);
    }
  }
}

async function deploy() {
  console.log("Build Angular...");
  execSync(
    "ng build --configuration=production --output-path docs --base-href ./",
    { stdio: "inherit" },
  );

  console.log("Déplacement du contenu de browser vers docs...");
  moveBrowserContent();

  console.log("Commit + push Git...");
  gitCommitPush();
}

deploy();
