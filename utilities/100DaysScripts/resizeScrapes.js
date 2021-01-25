/**
 *  Resizes the instagram scrapes a la getProjetThumbnail.js by Aidan
 * 
 *  August Luhrs Jan 2020
 * 
 *  for each account folder, get file, resize, save to new file based on timestamp from original scrape
 *  also renaming old scrapes so don't have redundant resizes on subsequent runs
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootPath = '/home/dangalf/Desktop/YORB/YORB2020/'; //not sure if i need this, but was throwing errors when tried relative path with path.join (normalizing?)
const scrapesFolder = path.join(rootPath, 'src/assets/images/100Days/scrapes');
const resizedFolder = path.join(rootPath, 'src/assets/images/100Days/resized');

let accountFolders = [];

//for each account folder, make an object that has that account and all the post files saved in that dir
fs.readdirSync(scrapesFolder).map(dirName => {
    let accountDir = path.join(scrapesFolder, dirName);
    let posts = fs.readdirSync(accountDir);
    accountFolders.push({path: accountDir, account: dirName, posts: posts}); 

    //also need to make account dir in resized if it doesn't already exist
    if (!fs.existsSync(path.join(resizedFolder, dirName))){
        fs.mkdirSync(path.join(resizedFolder, dirName));
    }
});

console.log(accountFolders);

for (let folder of accountFolders) {
    fs.readdirSync(folder.path).map(fileName => {
        console.log(path.join(folder.path, fileName));
        //check for old posts
        if(!fileName.includes('old')){
            //make a folder per day so we can sort by date
            let day = fileName.substr(0, 8);
            let dayFolder = path.join(resizedFolder, folder.account, day);
            if(!fs.existsSync(dayFolder)) {
                fs.mkdirSync(dayFolder);
            }

            //name the file sequentially based on existing posts from that day
            let existingNum = fs.readdirSync(dayFolder).length;

            if(fileName.includes('.jpg')) { //its an image
                //resize the image and save to the resized folder
                sharp(path.join(folder.path, fileName))
                .resize(256, 256)
                .toFile(path.join(dayFolder, existingNum + '.png'), (err, info) => {
                    if (err) {
                        console.log('ERROR at ' + folder.path + '/' + fileName + " : " + err);
                    } else {
                        //moving this here so won't skip files that haven't actually been resized
                        //rename old file so won't trigger on subsequent runs
                        fs.renameSync(path.join(folder.path, fileName), path.join(folder.path, 'old' + fileName));
                    }
                    if (info) {
                        console.log("INFO at " + dayFolder + " : " + info);
                    }
                })
            } else { //its a video -- TODO: figure out resize
                //for now just add 'old' and move to the resized folder even though it hasn't been resized
                fs.copyFileSync(path.join(folder.path, fileName), path.join(folder.path, 'old' + fileName));     
                fs.renameSync(path.join(folder.path, fileName), path.join(dayFolder, existingNum + 'needsResize.mp4')); //hopefully can use .includes('needsResize') to do this later
            }
        }
    });
}