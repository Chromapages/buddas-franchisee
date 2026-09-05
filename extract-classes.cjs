const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const classUsage = {
  maxWidth: new Set(),
  paddingX: new Set(),
  paddingY: new Set(),
  marginX: new Set(),
  marginY: new Set(),
};

const regex = /(?:^|\s|\"|\'|\`|:)(max-w-[a-z0-9\-]+|p[xy]-[a-z0-9\-\[\]\.]+|m[xy]-[a-z0-9\-\[\]\.]+|(?:sm|md|lg|xl|2xl):(?:max-w-[a-z0-9\-]+|p[xy]-[a-z0-9\-\[\]\.]+|m[xy]-[a-z0-9\-\[\]\.]+))/g;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(srcPath);

const summary = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  summary[file.replace(srcPath, '')] = new Set();
  
  while ((match = regex.exec(content)) !== null) {
    const cls = match[1];
    summary[file.replace(srcPath, '')].add(cls);
    if (cls.includes('max-w')) classUsage.maxWidth.add(cls);
    else if (cls.includes('px-')) classUsage.paddingX.add(cls);
    else if (cls.includes('py-')) classUsage.paddingY.add(cls);
    else if (cls.includes('mx-')) classUsage.marginX.add(cls);
    else if (cls.includes('my-')) classUsage.marginY.add(cls);
  }
});

console.log("--- MAX WIDTH ---");
console.log(Array.from(classUsage.maxWidth).sort().join('\n'));
console.log("\n--- PADDING X ---");
console.log(Array.from(classUsage.paddingX).sort().join('\n'));
console.log("\n--- PADDING Y ---");
console.log(Array.from(classUsage.paddingY).sort().join('\n'));
console.log("\n--- MARGIN X ---");
console.log(Array.from(classUsage.marginX).sort().join('\n'));
console.log("\n--- MARGIN Y ---");
console.log(Array.from(classUsage.marginY).sort().join('\n'));

console.log("\n--- BY FILE ---");
for (const [file, classes] of Object.entries(summary)) {
    if (classes.size > 0) {
        console.log(file + ": " + Array.from(classes).sort().join(', '));
    }
}
