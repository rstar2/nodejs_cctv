const path = require("path");
const fs = require("fs").promises;

const historyCount = 11; // 10 +1 because of the symlink
const historyPath = path.resolve(__dirname, "../public/history");
const latestImagePath = path.resolve(historyPath, "latest.png");

// const period = 1000 * 60 * 60; // 1 hour
const period = 1000 * 5; // 5 secs

let isStoring = false;
let toStore = true;
let storeInterval;
let notStartedOnProcessErr = false;

async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Real storing to file-system
 * @param {Buffer} image
 * @param {Date} date
 * @return {Promise}
 */
async function store(image, date) {
  const imagePath = path.resolve(historyPath, "" + date.getTime()) + ".png";
  await fs.writeFile(imagePath, image);
  if (await exists(latestImagePath)) await fs.unlink(latestImagePath);
  await fs.symlink(imagePath, latestImagePath);

  // check if more than historyCount images are saved and delete oldest

  // first read the dir contents
  let files = await fs.readdir(historyPath);

  // note there are may be 3 files and 10 folders , but still if "all" are less than allowed
  // then it's for sure ok all
  if (files.length < historyCount) return;

  const imageFiles = [];
  for (let i = 0; i < files.length; i++) {
    const fullName = files[i];
    if (fullName === latestImagePath) continue;
    if (!fullName.endsWith(".png")) continue;

    const name = fullName.substring(0, fullName.length - 4);
    // "simple assumption" that the name is a number, e.g original as 1231313123233.png
    // it's not a bullet-proof solution
    const num = +name;
    if (isNaN(num)) continue;

    imageFiles.push({ num, fullName });
  }

  if (imageFiles.length < historyCount) return;

  imageFiles.sort((item1, item2) => (item1.num === item2.num ? 0 : item1.num < item2.num ? -1 : 1));

  // delete the extra
  const extra = imageFiles.length - historyCount + 1; // don't count the symlink
  const deletePromises = [];
  for (let i = 0; i < extra; i++) {
    deletePromises.push(fs.unlink(path.resolve(historyPath, imageFiles[i].fullName)));
  }

  return Promise.all(deletePromises);
}

/**
 * Process this image - e.g. form time to time save them
 * @param {Buffer} image
 * @param {Date} date
 */
exports.process = function (image, date) {
  if (!storeInterval) {
    // trace only once as it's called multiple times
    if (!notStartedOnProcessErr) {
      console.warn("Not started yet");
      notStartedOnProcessErr = true;
    }
    return;
  }

  // skip
  if (!toStore) return;

  // as storing is async and can take some time,
  // then don't execute a new one until current store finishes
  if (!isStoring) {
    // so skip until interval again make it to true later
    toStore = false;

    isStoring = true;
    store(image, date)
      .catch((e) => console.error(e))
      .then(() => (isStoring = false));
  }
};

/**
 * Start the history storing
 * @return
 */
exports.start = function () {
  if (storeInterval) return console.warn("Already started");

  toStore = true;
  storeInterval = setInterval(() => (toStore = true), period);
};

/**
 * Stop the history storing
 * @return
 */
exports.stop = function () {
  if (!storeInterval) return console.warn("Already stopped");

  clearInterval(storeInterval);
  storeInterval = undefined;
  toStore = false;
  notStartedOnProcessErr = false;
};
