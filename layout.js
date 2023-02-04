const fs = require("fs");
const xml = require("xml2json");
const format = require("xml-formatter");
const NUM_NEW_ENTRIES = process.argv[2];
const NUM_ROWS = process.argv[3];
const PADDING = process.argv[4];

let layoutName;
try {
	layoutName = fs.readdirSync("./").filter(x => x.endsWith(".layout"))[0];
} catch {
	console.log("There is no layout file to modify.");
	return;
}

let layout = fs.readFileSync(`./${layoutName}`, "utf-8");
let layoutJson = xml.toJson(layout, { object: true, coerce: true });
let subTextures = layoutJson.TextureAtlas.SubTexture;
let lastEntry = subTextures[subTextures.length - 1];
let lastEntryId = parseInt(lastEntry.name.slice(lastEntry.name.lastIndexOf("_") + 1).slice(0, -4));
let lastEntryX = lastEntry.x;
let lastEntryY = lastEntry.y;
let lastEntryWidth = parseInt(lastEntry.width) + parseInt(PADDING);
let lastEntryHeight = parseInt(lastEntry.height) + parseInt(PADDING);
let newEntryCount = NUM_NEW_ENTRIES;
while (newEntryCount > 0) {
    newEntryCount--;
    let newEntry = { ...lastEntry };
    lastEntryId++;
    lastEntryY += lastEntryHeight;
    if (lastEntryY / lastEntryHeight >= NUM_ROWS) {
        lastEntryY = 0;
        lastEntryX += lastEntryWidth;
    }
    newEntry.name = `MENU_ItemIcon_${lastEntryId}.png`;
    newEntry.y = lastEntryY;
    newEntry.x = lastEntryX;
    subTextures.push(newEntry);
}
layoutJson.TextureAtlas.SubTexture = subTextures;
let newXml = xml.toXml(layoutJson).replace(/><\/SubTexture>/g, "/>").replace("\r", "");
fs.writeFileSync(`./${layoutName.replace(".layout", "")}_o.layout`, format(newXml, {
    indentation: '\t', 
    filter: (node) => node.type !== 'Comment', 
    collapseContent: true, 
    lineSeparator: '\n'
}));